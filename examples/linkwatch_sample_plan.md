# Verified Implementation Plan: Migrate `requests` &rarr; `httpx`
**Scan ID:** `scan_linkwatch_reference_001` | **Status:** Developer Approved

### 1. Objective and Scope
Safely migrate Python codebase from `requests` to `httpx` with zero regressions.

### 2. Current State
`requests` is currently used across 1 file(s) with 1 call/import site(s).

### 3. Files Likely to Change
- `linkwatch/monitor.py`
- `requirements.txt`

### 4. Ordered Implementation Steps
1. Create a feature branch `migrate/requests-to-httpx`.
2. Execute baseline tests to establish pre-migration test suite health (`python -m pytest`).
3. Update dependency declarations in `requirements.txt`: remove `requests==2.22.0` and add `httpx>=0.27.0`.
4. Update imports across identified files: `linkwatch/monitor.py`.
5. Adapt specific API call patterns: replace `requests.get(url, timeout=self.timeout)` with `httpx.get(url, timeout=float(self.timeout))`.
6. Run isolated unit and integration test suite.
7. Execute post-implementation verification in the tool.
8. Commit clean git diff and submit pull request.

### 5. Dependency Manifest Changes
In `requirements.txt`: replace `requests==2.22.0` with `httpx>=0.27.0`.

### 6. Code Migration Details
In `linkwatch/monitor.py`:
```diff
-import requests
+import httpx

 def check_health(self, url):
-    resp = requests.get(url, timeout=self.timeout)
+    resp = httpx.get(url, timeout=float(self.timeout))
     return resp.status_code == 200
```

### 7. Execution Commands
```bash
pip install -r requirements.txt
python -m pytest -v
```

### 8. Verification Checklist
- [x] Branch created and working copy isolated (`proposed`)
- [x] Baseline tests verified passing (`evidence-backed`)
- [x] Dependency manifest updated (`proposed`)
- [x] Import statements refactored (`proposed`)
- [x] API calls adapted to candidate signatures (`proposed`)
- [x] Test suite executed with zero failures (`evidence-backed`)
- [x] Diff reviewed for unintended modifications (`proposed`)

### 9. Definition of Done
- [x] Zero references to `requests` in source tree.
- [x] `httpx` installed and declared in manifest.
- [x] Full test suite passes with exit code 0.
- [x] Post-implementation verification succeeds.
