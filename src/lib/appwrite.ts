import { Account, Client, ID, Permission, Query, Role, TablesDB } from 'appwrite';

export const APPWRITE_ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || '';
export const APPWRITE_PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '';
export const APPWRITE_DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'sparkshares';

const client = new Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID);

const account = new Account(client);
const tables = new TablesDB(client);

let anonymousSessionPromise: Promise<void> | null = null;

export interface ProjectRow {
  $id: string;
  name: string;
  description: string;
  bags_token_mint?: string;
  creator_wallet: string;
  fee_sharing_enabled?: boolean;
  fee_share_bps?: number;
  created_at: string;
}

export interface MicroGrantRow {
  $id: string;
  project_id: string;
  title: string;
  description: string;
  reward_amount: number;
  status: 'open' | 'completed';
  voting_enabled?: boolean;
  created_at: string;
}

export interface SubmissionRow {
  $id: string;
  grant_id: string;
  submitter_wallet: string;
  content: string;
  created_at: string;
}

export interface BackingRow {
  $id: string;
  grant_id: string;
  backer_wallet: string;
  amount_sol: number;
  tx_signature: string;
  created_at: string;
}

export interface VoteRow {
  $id: string;
  submission_id: string;
  grant_id: string;
  voter_wallet: string;
  created_at: string;
}

function defaultPermissions() {
  return [
    Permission.read(Role.any()),
    Permission.write(Role.any()),
    Permission.update(Role.any()),
    Permission.delete(Role.any()),
  ];
}

export async function ensureAppwriteSession() {
  try {
    await account.get();
    return;
  } catch {
    if (!anonymousSessionPromise) {
      anonymousSessionPromise = account.createAnonymousSession().then(() => undefined).finally(() => {
        anonymousSessionPromise = null;
      });
    }

    await anonymousSessionPromise;
  }
}

// ──────────────── Projects ────────────────

export async function listProjects() {
  await ensureAppwriteSession();
  const response = (await tables.listRows({
    databaseId: APPWRITE_DATABASE_ID,
    tableId: 'projects',
    queries: [Query.orderDesc('created_at')],
  })) as unknown as { rows: ProjectRow[] };

  return response.rows;
}

export async function listProjectsByCreator(creatorWallet: string) {
  await ensureAppwriteSession();
  const response = (await tables.listRows({
    databaseId: APPWRITE_DATABASE_ID,
    tableId: 'projects',
    queries: [Query.equal('creator_wallet', creatorWallet), Query.orderDesc('created_at')],
  })) as unknown as { rows: ProjectRow[] };

  return response.rows;
}

export async function createProject(data: Omit<ProjectRow, '$id' | 'created_at'> & { created_at?: string }) {
  await ensureAppwriteSession();
  return (await tables.createRow({
    databaseId: APPWRITE_DATABASE_ID,
    tableId: 'projects',
    rowId: ID.unique(),
    data: {
      ...data,
      created_at: data.created_at || new Date().toISOString(),
    },
    permissions: defaultPermissions(),
  })) as unknown as ProjectRow;
}

// ──────────────── Bounties / Micro-Grants ────────────────

export async function listBounties() {
  await ensureAppwriteSession();
  const response = (await tables.listRows({
    databaseId: APPWRITE_DATABASE_ID,
    tableId: 'micro_grants',
    queries: [Query.orderDesc('created_at')],
  })) as unknown as { rows: MicroGrantRow[] };

  return response.rows;
}

export async function listBountiesByProject(projectId: string) {
  await ensureAppwriteSession();
  const response = (await tables.listRows({
    databaseId: APPWRITE_DATABASE_ID,
    tableId: 'micro_grants',
    queries: [Query.equal('project_id', projectId), Query.orderDesc('created_at')],
  })) as unknown as { rows: MicroGrantRow[] };

  return response.rows;
}

export async function createBounty(data: Omit<MicroGrantRow, '$id' | 'created_at' | 'status'> & { status?: MicroGrantRow['status']; created_at?: string }) {
  await ensureAppwriteSession();
  return (await tables.createRow({
    databaseId: APPWRITE_DATABASE_ID,
    tableId: 'micro_grants',
    rowId: ID.unique(),
    data: {
      ...data,
      status: data.status || 'open',
      voting_enabled: data.voting_enabled ?? false,
      created_at: data.created_at || new Date().toISOString(),
    },
    permissions: defaultPermissions(),
  })) as unknown as MicroGrantRow;
}

export async function completeBounty(bountyId: string) {
  await ensureAppwriteSession();
  return (await tables.updateRow({
    databaseId: APPWRITE_DATABASE_ID,
    tableId: 'micro_grants',
    rowId: bountyId,
    data: { status: 'completed' },
  })) as unknown as MicroGrantRow;
}

// ──────────────── Submissions ────────────────

export async function listSubmissions() {
  await ensureAppwriteSession();
  const response = (await tables.listRows({
    databaseId: APPWRITE_DATABASE_ID,
    tableId: 'submissions',
    queries: [Query.orderDesc('created_at')],
  })) as unknown as { rows: SubmissionRow[] };

  return response.rows;
}

export async function listSubmissionsByGrantIds(grantIds: string[]) {
  const submissions = await listSubmissions();
  return submissions.filter((submission) => grantIds.includes(submission.grant_id));
}

export async function createSubmission(data: Omit<SubmissionRow, '$id' | 'created_at'> & { created_at?: string }) {
  await ensureAppwriteSession();
  return (await tables.createRow({
    databaseId: APPWRITE_DATABASE_ID,
    tableId: 'submissions',
    rowId: ID.unique(),
    data: {
      ...data,
      created_at: data.created_at || new Date().toISOString(),
    },
    permissions: defaultPermissions(),
  })) as unknown as SubmissionRow;
}

// ──────────────── Backings ────────────────

export async function listBackings() {
  await ensureAppwriteSession();
  const response = (await tables.listRows({
    databaseId: APPWRITE_DATABASE_ID,
    tableId: 'backings',
    queries: [Query.orderDesc('created_at')],
  })) as unknown as { rows: BackingRow[] };

  return response.rows;
}

export async function createBacking(data: Omit<BackingRow, '$id' | 'created_at'> & { created_at?: string }) {
  await ensureAppwriteSession();
  return (await tables.createRow({
    databaseId: APPWRITE_DATABASE_ID,
    tableId: 'backings',
    rowId: ID.unique(),
    data: {
      ...data,
      created_at: data.created_at || new Date().toISOString(),
    },
    permissions: defaultPermissions(),
  })) as unknown as BackingRow;
}

// ──────────────── Community Voting ────────────────

export async function listVotes() {
  await ensureAppwriteSession();
  try {
    const response = (await tables.listRows({
      databaseId: APPWRITE_DATABASE_ID,
      tableId: 'votes',
      queries: [Query.orderDesc('created_at')],
    })) as unknown as { rows: VoteRow[] };
    return response.rows;
  } catch {
    // votes table might not exist yet — return empty
    return [];
  }
}

export async function listVotesByGrant(grantId: string) {
  const allVotes = await listVotes();
  return allVotes.filter((vote) => vote.grant_id === grantId);
}

export async function listVotesBySubmission(submissionId: string) {
  const allVotes = await listVotes();
  return allVotes.filter((vote) => vote.submission_id === submissionId);
}

export async function hasVoted(voterWallet: string, grantId: string) {
  const votes = await listVotesByGrant(grantId);
  return votes.some((vote) => vote.voter_wallet === voterWallet);
}

export async function castVote(data: Omit<VoteRow, '$id' | 'created_at'> & { created_at?: string }) {
  await ensureAppwriteSession();

  // Check if user already voted on this grant
  const existingVotes = await listVotesByGrant(data.grant_id);
  const alreadyVoted = existingVotes.some((v) => v.voter_wallet === data.voter_wallet);
  if (alreadyVoted) {
    throw new Error('You have already voted on this bounty.');
  }

  return (await tables.createRow({
    databaseId: APPWRITE_DATABASE_ID,
    tableId: 'votes',
    rowId: ID.unique(),
    data: {
      ...data,
      created_at: data.created_at || new Date().toISOString(),
    },
    permissions: defaultPermissions(),
  })) as unknown as VoteRow;
}
