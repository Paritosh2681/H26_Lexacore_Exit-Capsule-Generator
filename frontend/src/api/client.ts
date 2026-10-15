import {
  ScanItem,
  ScanDetails,
  DependencyDetail,
  VerificationReport,
  CapsuleResponse,
  PostVerificationRun,
  SystemSettings
} from './types';

const API_BASE = '/api';

export async function startScan(repoPath: string, runAi: boolean = false, customMappings?: Record<string, string>): Promise<{ scan_id: string; status: string; message: string }> {
  const resp = await fetch(`${API_BASE}/scans/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ repo_path: repoPath, run_ai: runAi, custom_mappings: customMappings })
  });
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ detail: resp.statusText }));
    throw new Error(err.detail || 'Failed to start scan');
  }
  return resp.json();
}

export async function getScanProgress(scanId: string): Promise<{ scan_id: string; status: string; progress_pct: number; current_step: string; error_message?: string }> {
  const resp = await fetch(`${API_BASE}/scans/${scanId}/progress`);
  if (!resp.ok) throw new Error('Failed to fetch progress');
  return resp.json();
}

export async function listScans(): Promise<ScanItem[]> {
  const resp = await fetch(`${API_BASE}/scans/`);
  if (!resp.ok) throw new Error('Failed to fetch scans');
  return resp.json();
}

export async function getScanDetails(scanId: string): Promise<ScanDetails> {
  const resp = await fetch(`${API_BASE}/scans/${scanId}`);
  if (!resp.ok) throw new Error('Failed to fetch scan details');
  return resp.json();
}

export async function deleteScan(scanId: string): Promise<void> {
  const resp = await fetch(`${API_BASE}/scans/${scanId}`, { method: 'DELETE' });
  if (!resp.ok) throw new Error('Failed to delete scan');
}

export async function getDependencyDetails(scanId: string, packageName: string): Promise<DependencyDetail> {
  const resp = await fetch(`${API_BASE}/scans/${scanId}/dependencies/${packageName}`);
  if (!resp.ok) throw new Error('Failed to fetch dependency details');
  return resp.json();
}

export async function verifyDependency(scanId: string, packageName: string, candidatePackage: string, runLiveTests: boolean = true): Promise<VerificationReport> {
  const resp = await fetch(`${API_BASE}/scans/${scanId}/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ package_name: packageName, candidate_package: candidatePackage, run_live_tests: runLiveTests })
  });
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ detail: resp.statusText }));
    throw new Error(err.detail || 'Failed to verify dependency');
  }
  return resp.json();
}

export async function recordApproval(scanId: string, packageName: string, decision: 'APPROVED' | 'REJECTED', notes?: string): Promise<any> {
  const resp = await fetch(`${API_BASE}/scans/${scanId}/approval`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ package_name: packageName, decision, notes })
  });
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ detail: resp.statusText }));
    throw new Error(err.detail || 'Failed to record approval decision');
  }
  return resp.json();
}

export async function createImplementationPlan(scanId: string, packageName: string, candidatePackage: string): Promise<any> {
  const resp = await fetch(`${API_BASE}/scans/${scanId}/plan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ package_name: packageName, candidate_package: candidatePackage })
  });
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ detail: resp.statusText }));
    throw new Error(err.detail || 'Failed to create implementation plan');
  }
  return resp.json();
}

export async function getCapsule(scanId: string): Promise<CapsuleResponse> {
  const resp = await fetch(`${API_BASE}/scans/${scanId}/capsule`);
  if (!resp.ok) throw new Error('Failed to load capsule');
  return resp.json();
}

export async function postVerifyWorkingCopy(scanId: string, workingCopyPath: string, targetPackage: string, candidatePackage: string): Promise<PostVerificationRun> {
  const resp = await fetch(`${API_BASE}/scans/${scanId}/post-verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      working_copy_path: workingCopyPath,
      target_package: targetPackage,
      candidate_package: candidatePackage
    })
  });
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ detail: resp.statusText }));
    throw new Error(err.detail || 'Failed to run post-implementation verification');
  }
  return resp.json();
}

export async function getPostVerifications(scanId: string): Promise<PostVerificationRun[]> {
  const resp = await fetch(`${API_BASE}/scans/${scanId}/post-verify`);
  if (!resp.ok) throw new Error('Failed to fetch post-verification runs');
  return resp.json();
}

export async function getSettings(): Promise<SystemSettings> {
  const resp = await fetch(`${API_BASE}/settings`);
  if (!resp.ok) throw new Error('Failed to fetch settings');
  return resp.json();
}

export async function listVerificationChecks(scanId: string): Promise<import('./types').VerificationCheckRecord[]> {
  const resp = await fetch(`${API_BASE}/scans/${scanId}/verifications`);
  if (!resp.ok) throw new Error('Failed to fetch verification checks');
  return resp.json();
}

export async function listImplementationPlans(scanId: string): Promise<import('./types').ImplementationPlanSummary[]> {
  const resp = await fetch(`${API_BASE}/scans/${scanId}/plans`);
  if (!resp.ok) throw new Error('Failed to fetch implementation plans');
  return resp.json();
}

export async function getImplementationPlan(scanId: string, packageName: string): Promise<any> {
  const resp = await fetch(`${API_BASE}/scans/${scanId}/plan/${packageName}`);
  if (!resp.ok) throw new Error('Failed to fetch implementation plan');
  return resp.json();
}

function getSessionHeader(): Record<string, string> {
  const sid = localStorage.getItem('exit_capsule_gh_session');
  return sid ? { 'X-Session-ID': sid } : {};
}

export async function getGitHubStatus(): Promise<import('./types').GitHubAuthStatus> {
  const resp = await fetch(`${API_BASE}/auth/github/status`, {
    headers: getSessionHeader()
  });
  if (!resp.ok) throw new Error('Failed to fetch GitHub status');
  return resp.json();
}

export async function getGitHubLoginUrl(): Promise<{ auth_url: string; state: string }> {
  const resp = await fetch(`${API_BASE}/auth/github/login`);
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ detail: resp.statusText }));
    throw new Error(err.detail || 'GitHub OAuth not configured on server');
  }
  return resp.json();
}

export async function completeGitHubCallback(code: string, state?: string): Promise<{ session_id: string; user: import('./types').GitHubUser }> {
  const resp = await fetch(`${API_BASE}/auth/github/callback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, state })
  });
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ detail: resp.statusText }));
    throw new Error(err.detail || 'Failed to complete GitHub authorization');
  }
  const data = await resp.json();
  if (data.session_id) {
    localStorage.setItem('exit_capsule_gh_session', data.session_id);
  }
  return data;
}

export async function disconnectGitHub(): Promise<void> {
  const sid = localStorage.getItem('exit_capsule_gh_session');
  await fetch(`${API_BASE}/auth/github/disconnect`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sid })
  }).catch(() => {});
  localStorage.removeItem('exit_capsule_gh_session');
}

export async function listGitHubRepositories(search?: string): Promise<import('./types').GitHubRepository[]> {
  const url = search 
    ? `${API_BASE}/auth/github/repos?search=${encodeURIComponent(search)}`
    : `${API_BASE}/auth/github/repos`;
  const resp = await fetch(url, {
    headers: getSessionHeader()
  });
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ detail: resp.statusText }));
    throw new Error(err.detail || 'Failed to fetch GitHub repositories');
  }
  return resp.json();
}

export async function cloneAndScanGitHubRepo(
  repoFullName: string,
  cloneUrl?: string,
  defaultBranch?: string,
  runAi: boolean = false
): Promise<{ scan_id: string; status: string; message: string }> {
  const resp = await fetch(`${API_BASE}/auth/github/clone-and-scan`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getSessionHeader()
    },
    body: JSON.stringify({
      repo_full_name: repoFullName,
      clone_url: cloneUrl,
      default_branch: defaultBranch,
      run_ai: runAi
    })
  });
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ detail: resp.statusText }));
    throw new Error(err.detail || 'Failed to clone and analyze GitHub repository');
  }
  return resp.json();
}

