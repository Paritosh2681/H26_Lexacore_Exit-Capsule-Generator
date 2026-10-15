import React, { useState } from 'react';
import { 
  ArrowRight, 
  ArrowUpRight, 
  Check, 
  Copy, 
  ShieldCheck, 
  FileText, 
  Terminal, 
  X, 
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Code2,
  FileCode,
  RotateCcw
} from 'lucide-react';
import { EditorialNavbar } from '../components/editorial/EditorialNavbar';
import { HeroReportArtifact } from '../components/editorial/HeroReportArtifact';
import { ProductShowcase } from '../components/editorial/ProductShowcase';

interface LandingPageProps {
  onAnalyzeRepo: () => void;
  onOpenDashboard: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onAnalyzeRepo, onOpenDashboard }) => {
  const [docsModalOpen, setDocsModalOpen] = useState(false);
  const [promptCopied, setPromptCopied] = useState(false);

  const specimenPrompt = `You are an automated Python migration agent.
Execute the verified Exit Capsule for 'requests' -> 'httpx' under repository 'fastapi-telemetry-service'.

DIRECTIVE:
1. Replace requests.get(...) with httpx.get(..., timeout=10.0) in 'src/telemetry/client.py'.
2. Update HTTPBasicAuth import to httpx.BasicAuth in 'src/metrics/exporter.py'.
3. Update requirements.txt: remove 'requests==2.22.0', pin 'httpx==0.27.0'.
4. Run 'pytest tests/' in isolated virtualenv.
5. If pytest fails, execute 'git restore .' immediately.`;

  const copyPrompt = () => {
    navigator.clipboard.writeText(specimenPrompt);
    setPromptCopied(true);
    setTimeout(() => setPromptCopied(false), 2000);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#FAFAF8',
      color: '#111210',
      fontFamily: 'var(--font-interface)',
      lineHeight: 1.6,
      overflowX: 'hidden'
    }}>
      {/* Editorial Sticky Navbar */}
      <EditorialNavbar
        onOpenWorkspace={onAnalyzeRepo}
        onOpenDocs={() => setDocsModalOpen(true)}
      />

      {/* HERO SECTION */}
      <section style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '72px 24px 64px',
        textAlign: 'left'
      }}>
        <div style={{ maxWidth: '820px', marginBottom: '48px' }}>
          {/* Eyebrow */}
          <div style={{
            fontSize: '0.74rem',
            fontFamily: 'var(--font-mono)',
            fontWeight: 600,
            color: '#696B66',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: '18px'
          }}>
            DEPENDENCY MAINTENANCE / EVIDENCE-BASED MIGRATION
          </div>

          {/* Headline */}
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2.4rem, 4.8vw, 3.8rem)',
            fontWeight: 700,
            lineHeight: 1.12,
            letterSpacing: '-0.035em',
            color: '#111210',
            marginBottom: '20px'
          }}>
            Know what breaks before you change it.
          </h1>

          {/* Supporting copy */}
          <p style={{
            fontSize: 'clamp(1rem, 1.8vw, 1.15rem)',
            color: '#696B66',
            lineHeight: 1.6,
            maxWidth: '680px',
            marginBottom: '32px'
          }}>
            Exit Capsule examines dependency risk, maps real code usage, checks AI-generated migration proposals, and turns the findings into an actionable implementation plan.
          </p>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <button
              onClick={onAnalyzeRepo}
              style={{
                background: '#111210',
                color: '#FAFAF8',
                border: '1px solid #111210',
                borderRadius: '6px',
                padding: '12px 24px',
                fontSize: '0.92rem',
                fontWeight: 500,
                fontFamily: 'var(--font-interface)',
                cursor: 'pointer',
                transition: 'opacity 0.15s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
            >
              Open workspace
            </button>

            <a
              href="#workflow"
              style={{
                color: '#111210',
                fontSize: '0.92rem',
                fontWeight: 500,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                borderBottom: '1px solid #E7E8E3',
                paddingBottom: '2px',
                transition: 'border-color 0.15s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#111210')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#E7E8E3')}
            >
              Explore the workflow &rarr;
            </a>
          </div>
        </div>

        {/* Hero Visual: Real Product Artifact (Specimen Exit Capsule Report) */}
        <div>
          <HeroReportArtifact />
        </div>
      </section>

      {/* SECTION 2 — THE PROBLEM */}
      <section style={{
        borderTop: '1px solid #E7E8E3',
        borderBottom: '1px solid #E7E8E3',
        background: '#FFFFFF',
        padding: '80px 24px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ maxWidth: '720px', marginBottom: '56px' }}>
            <div style={{
              fontSize: '0.72rem',
              fontFamily: 'var(--font-mono)',
              color: '#696B66',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '12px'
            }}>
              02 / THE VERIFICATION PROBLEM
            </div>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.8rem, 3.2vw, 2.6rem)',
              fontWeight: 700,
              letterSpacing: '-0.025em',
              color: '#111210',
              lineHeight: 1.2
            }}>
              A plausible fix is not the same as a verified fix.
            </h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '40px',
            borderTop: '1px solid #E7E8E3',
            paddingTop: '36px'
          }}>
            {/* Observation 01 */}
            <div>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.8rem',
                color: '#95ABA7',
                fontWeight: 600,
                marginBottom: '12px'
              }}>
                01
              </div>
              <h3 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.2rem',
                fontWeight: 600,
                color: '#111210',
                marginBottom: '8px'
              }}>
                Dependencies age.
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#696B66', lineHeight: 1.6 }}>
                A package may become incompatible, difficult to maintain, or harder to replace as upstream releases stall and modern Python versions advance.
              </p>
            </div>

            {/* Observation 02 */}
            <div>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.8rem',
                color: '#95ABA7',
                fontWeight: 600,
                marginBottom: '12px'
              }}>
                02
              </div>
              <h3 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.2rem',
                fontWeight: 600,
                color: '#111210',
                marginBottom: '8px'
              }}>
                Recommendations need evidence.
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#696B66', lineHeight: 1.6 }}>
                A language model can propose an alternative without proving API compatibility, parameter parity, or actual runtime behavior.
              </p>
            </div>

            {/* Observation 03 */}
            <div>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.8rem',
                color: '#95ABA7',
                fontWeight: 600,
                marginBottom: '12px'
              }}>
                03
              </div>
              <h3 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.2rem',
                fontWeight: 600,
                color: '#111210',
                marginBottom: '8px'
              }}>
                Migrations need a plan.
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#696B66', lineHeight: 1.6 }}>
                Developers need specific file changes, reproducible tests, rollback procedures, and a clear understanding of what remains unresolved.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3 — HOW IT WORKS */}
      <section id="workflow" style={{ padding: '88px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ maxWidth: '720px', marginBottom: '56px' }}>
            <div style={{
              fontSize: '0.72rem',
              fontFamily: 'var(--font-mono)',
              color: '#696B66',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '12px'
            }}>
              03 / WORKFLOW SEQUENCE
            </div>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.8rem, 3.2vw, 2.6rem)',
              fontWeight: 700,
              letterSpacing: '-0.025em',
              color: '#111210'
            }}>
              From dependency discovery to an implementation plan.
            </h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '24px',
            borderTop: '1px solid #E7E8E3',
            paddingTop: '32px'
          }}>
            {[
              {
                step: '01',
                title: 'Inspect',
                desc: 'Read dependency declarations and Python source code declarations.'
              },
              {
                step: '02',
                title: 'Map',
                desc: 'Identify statically observable imports, calls, and exact source file locations.'
              },
              {
                step: '03',
                title: 'Recommend',
                desc: 'Use Gemma 4 to propose a replacement based on observed repository evidence.'
              },
              {
                step: '04',
                title: 'Verify',
                desc: 'Check package availability, inspect compatibility where feasible, and run tests in isolated environments.'
              },
              {
                step: '05',
                title: 'Plan',
                desc: 'Generate a reusable Exit Capsule and a developer-approved migration plan.'
              }
            ].map((s) => (
              <div key={s.step} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.78rem',
                  color: '#95ABA7',
                  fontWeight: 600
                }}>
                  {s.step}
                </div>
                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.05rem',
                  fontWeight: 600,
                  color: '#111210'
                }}>
                  {s.title}
                </div>
                <p style={{ fontSize: '0.84rem', color: '#696B66', lineHeight: 1.5, margin: 0 }}>
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4 — SHOW THE PRODUCT */}
      <section id="product" style={{
        borderTop: '1px solid #E7E8E3',
        borderBottom: '1px solid #E7E8E3',
        background: '#FFFFFF',
        padding: '88px 24px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ maxWidth: '720px', marginBottom: '48px' }}>
            <div style={{
              fontSize: '0.72rem',
              fontFamily: 'var(--font-mono)',
              color: '#696B66',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '12px'
            }}>
              04 / PRODUCT INTERFACE
            </div>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.8rem, 3.2vw, 2.6rem)',
              fontWeight: 700,
              letterSpacing: '-0.025em',
              color: '#111210'
            }}>
              Every recommendation has a paper trail.
            </h2>
            <p style={{ fontSize: '0.95rem', color: '#696B66', marginTop: '12px' }}>
              Inspect AST call sites, risk breakdowns, and deterministic test outcomes inside the live workspace.
            </p>
          </div>

          {/* Product Showcase Component */}
          <ProductShowcase onOpenWorkspace={onAnalyzeRepo} />
        </div>
      </section>

      {/* SECTION 5 — EVIDENCE */}
      <section id="evidence" style={{ padding: '88px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ maxWidth: '720px', marginBottom: '56px' }}>
            <div style={{
              fontSize: '0.72rem',
              fontFamily: 'var(--font-mono)',
              color: '#696B66',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '12px'
            }}>
              05 / EVIDENCE CLASSIFICATION
            </div>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.8rem, 3.2vw, 2.6rem)',
              fontWeight: 700,
              letterSpacing: '-0.025em',
              color: '#111210'
            }}>
              Know what was observed. Know what was tested.
            </h2>
            <p style={{ fontSize: '0.95rem', color: '#696B66', marginTop: '12px', lineHeight: 1.6 }}>
              Exit Capsule maintains a strict distinction between static facts, executed tests, and model suggestions. A missing or inconclusive check is never treated as a passing check.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '32px'
          }}>
            {/* Column 1: OBSERVED */}
            <div style={{
              background: '#FFFFFF',
              border: '1px solid #E7E8E3',
              borderRadius: '8px',
              padding: '28px'
            }}>
              <div style={{
                fontSize: '0.72rem',
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                color: '#2E594F',
                background: '#EFF5F3',
                border: '1px solid #C8DDD7',
                padding: '3px 8px',
                borderRadius: '4px',
                display: 'inline-block',
                marginBottom: '16px'
              }}>
                OBSERVED
              </div>
              <h3 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.15rem',
                fontWeight: 600,
                color: '#111210',
                marginBottom: '8px'
              }}>
                Facts from source files
              </h3>
              <p style={{ fontSize: '0.86rem', color: '#696B66', lineHeight: 1.6, marginBottom: '16px' }}>
                Extracted directly from dependency manifests, Python AST trees, and package metadata registries without executing code.
              </p>
              <div style={{
                padding: '8px 12px',
                background: '#F5F6F3',
                border: '1px solid #E7E8E3',
                borderRadius: '4px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.74rem',
                color: '#111210'
              }}>
                requests==2.22.0 declared in requirements.txt:L18
              </div>
            </div>

            {/* Column 2: EXECUTED */}
            <div style={{
              background: '#FFFFFF',
              border: '1px solid #E7E8E3',
              borderRadius: '8px',
              padding: '28px'
            }}>
              <div style={{
                fontSize: '0.72rem',
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                color: '#111210',
                background: '#F0F2EF',
                border: '1px solid #D1D6D2',
                padding: '3px 8px',
                borderRadius: '4px',
                display: 'inline-block',
                marginBottom: '16px'
              }}>
                EXECUTED
              </div>
              <h3 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.15rem',
                fontWeight: 600,
                color: '#111210',
                marginBottom: '8px'
              }}>
                Sandbox test runs
              </h3>
              <p style={{ fontSize: '0.86rem', color: '#696B66', lineHeight: 1.6, marginBottom: '16px' }}>
                Outputs, exit codes, and receipts generated from commands, installations, and regression tests run in isolated virtual environments.
              </p>
              <div style={{
                padding: '8px 12px',
                background: '#F5F6F3',
                border: '1px solid #E7E8E3',
                borderRadius: '4px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.74rem',
                color: '#111210'
              }}>
                sandbox/pytest: exit_code=0 (18 passed, 0 failed)
              </div>
            </div>

            {/* Column 3: AI-SUGGESTED */}
            <div style={{
              background: '#FFFFFF',
              border: '1px solid #E7E8E3',
              borderRadius: '8px',
              padding: '28px'
            }}>
              <div style={{
                fontSize: '0.72rem',
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                color: '#696B66',
                background: '#F5F6F3',
                border: '1px solid #E7E8E3',
                padding: '3px 8px',
                borderRadius: '4px',
                display: 'inline-block',
                marginBottom: '16px'
              }}>
                AI-SUGGESTED
              </div>
              <h3 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.15rem',
                fontWeight: 600,
                color: '#111210',
                marginBottom: '8px'
              }}>
                Model proposals
              </h3>
              <p style={{ fontSize: '0.86rem', color: '#696B66', lineHeight: 1.6, marginBottom: '16px' }}>
                Replacements proposed by Gemma 4 based on repository context. Quarantined as unverified until empirical verification succeeds.
              </p>
              <div style={{
                padding: '8px 12px',
                background: '#F5F6F3',
                border: '1px solid #E7E8E3',
                borderRadius: '4px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.74rem',
                color: '#111210'
              }}>
                Candidate replacement: httpx &gt;= 0.27.0
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6 — IMPLEMENTATION PLANNING */}
      <section id="planning" style={{
        borderTop: '1px solid #E7E8E3',
        borderBottom: '1px solid #E7E8E3',
        background: '#FFFFFF',
        padding: '88px 24px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ maxWidth: '720px', marginBottom: '52px' }}>
            <div style={{
              fontSize: '0.72rem',
              fontFamily: 'var(--font-mono)',
              color: '#696B66',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '12px'
            }}>
              06 / IMPLEMENTATION SPECIFICATION
            </div>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.8rem, 3.2vw, 2.6rem)',
              fontWeight: 700,
              letterSpacing: '-0.025em',
              color: '#111210'
            }}>
              Find the issue. Leave with a plan.
            </h2>
            <p style={{ fontSize: '0.95rem', color: '#696B66', marginTop: '12px', lineHeight: 1.6 }}>
              Developers remain in full control. Follow the plan manually or feed the verified prompt into your preferred AI coding agent. Implementation must be tested again after changes are made.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '32px'
          }}>
            {/* Plan Document Preview */}
            <div style={{
              border: '1px solid #E7E8E3',
              borderRadius: '8px',
              padding: '24px',
              background: '#FAFAF8'
            }}>
              <div style={{
                fontSize: '0.72rem',
                fontFamily: 'var(--font-mono)',
                color: '#696B66',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                marginBottom: '14px'
              }}>
                Structured Plan Contents
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { title: 'Affected files', desc: 'Mapped directly from AST import and call sites.' },
                  { title: 'Ordered code changes', desc: 'Step-by-step refactoring tasks with dependency ordering.' },
                  { title: 'Migration notes', desc: 'API differences and parameter signature mappings.' },
                  { title: 'Verification checklist', desc: '10 validation checks with pass/fail gates.' },
                  { title: 'Rollback considerations', desc: 'Git restore procedures and lockfile reversions.' },
                  { title: 'Remaining risks', desc: 'Explicit notes on any unverified edge cases.' }
                ].map((item, idx) => (
                  <div key={idx} style={{
                    padding: '8px 12px',
                    background: '#FFFFFF',
                    border: '1px solid #E7E8E3',
                    borderRadius: '4px'
                  }}>
                    <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#111210' }}>{item.title}</div>
                    <div style={{ fontSize: '0.76rem', color: '#696B66', marginTop: '2px' }}>{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Agent Directive Preview */}
            <div style={{
              border: '1px solid #E7E8E3',
              borderRadius: '8px',
              padding: '24px',
              background: '#FFFFFF',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '14px',
                  paddingBottom: '10px',
                  borderBottom: '1px solid #E7E8E3'
                }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#111210', fontFamily: 'var(--font-interface)' }}>
                    Copyable AI Agent Directive
                  </div>

                  <button
                    onClick={copyPrompt}
                    style={{
                      background: promptCopied ? '#EFF5F3' : '#111210',
                      color: promptCopied ? '#2E594F' : '#FAFAF8',
                      border: promptCopied ? '1px solid #C8DDD7' : '1px solid #111210',
                      borderRadius: '4px',
                      padding: '4px 10px',
                      fontSize: '0.74rem',
                      fontFamily: 'var(--font-interface)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    {promptCopied ? <Check size={12} /> : <Copy size={12} />}
                    {promptCopied ? 'Copied' : 'Copy Directive'}
                  </button>
                </div>

                <pre style={{
                  margin: 0,
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.74rem',
                  color: '#111210',
                  lineHeight: 1.55,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  background: '#FAFAF8',
                  padding: '12px',
                  borderRadius: '4px',
                  border: '1px solid #E7E8E3'
                }}>
                  {specimenPrompt}
                </pre>
              </div>

              <div style={{
                marginTop: '16px',
                fontSize: '0.74rem',
                color: '#696B66',
                borderTop: '1px solid #E7E8E3',
                paddingTop: '12px'
              }}>
                Compatible with Cursor, Claude Code, GitHub Copilot, and Gemini CLI. Instructs agents to avoid unrelated refactors.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7 — FINAL CTA */}
      <section style={{
        padding: '96px 24px',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2rem, 3.6vw, 3rem)',
            fontWeight: 700,
            letterSpacing: '-0.03em',
            color: '#111210',
            lineHeight: 1.15,
            marginBottom: '16px'
          }}>
            Make dependency changes with evidence.
          </h2>

          <p style={{
            fontSize: '1.05rem',
            color: '#696B66',
            lineHeight: 1.6,
            marginBottom: '32px'
          }}>
            Inspect the repository. Challenge the recommendation. Verify the result.
          </p>

          <button
            onClick={onAnalyzeRepo}
            style={{
              background: '#111210',
              color: '#FAFAF8',
              border: '1px solid #111210',
              borderRadius: '6px',
              padding: '12px 28px',
              fontSize: '0.95rem',
              fontWeight: 500,
              fontFamily: 'var(--font-interface)',
              cursor: 'pointer',
              transition: 'opacity 0.15s ease'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            Open Exit Capsule &rarr;
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{
        borderTop: '1px solid #E7E8E3',
        background: '#FAFAF8',
        padding: '48px 24px 36px',
        fontSize: '0.84rem'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '32px',
          marginBottom: '32px'
        }}>
          <div style={{ maxWidth: '380px' }}>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1rem',
              fontWeight: 700,
              color: '#111210',
              marginBottom: '6px'
            }}>
              Exit Capsule
            </div>
            <p style={{ color: '#696B66', fontSize: '0.82rem', lineHeight: 1.5 }}>
              An AI-assisted dependency maintenance tool that analyzes Python repositories, verifies claims through independent checks, and creates evidence-backed plans.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
            <a href="#product" style={{ color: '#696B66', textDecoration: 'none' }}>Product</a>
            <a href="#workflow" style={{ color: '#696B66', textDecoration: 'none' }}>Workflow</a>
            <a href="#evidence" style={{ color: '#696B66', textDecoration: 'none' }}>Evidence</a>
            <button
              onClick={() => setDocsModalOpen(true)}
              style={{ background: 'transparent', border: 'none', color: '#696B66', cursor: 'pointer', padding: 0, fontSize: '0.84rem' }}
            >
              Documentation
            </button>
            <a
              href="https://github.com/Paritosh2681/H26_Lexacore_Exit-Capsule-Generator"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#696B66', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '3px' }}
            >
              Repository <ArrowUpRight size={12} />
            </a>
          </div>
        </div>

        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          paddingTop: '20px',
          borderTop: '1px solid #E7E8E3',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          fontSize: '0.74rem',
          color: '#8C8E88',
          fontFamily: 'var(--font-mono)'
        }}>
          <div>Released under the Apache 2.0 License • All scans run locally in isolated sandboxes.</div>
          <div>Exit Capsule Engine v1.0.0</div>
        </div>
      </footer>

      {/* DOCUMENTATION MODAL */}
      {docsModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(17, 18, 16, 0.5)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          zIndex: 200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '680px',
            maxHeight: '85vh',
            background: '#FFFFFF',
            borderRadius: '8px',
            border: '1px solid #E7E8E3',
            boxShadow: '0 20px 40px rgba(0,0,0,0.12)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid #E7E8E3',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span style={{ fontWeight: 600, color: '#111210', fontSize: '0.92rem' }}>
                Exit Capsule Documentation
              </span>
              <button
                onClick={() => setDocsModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#696B66', cursor: 'pointer' }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '18px', fontSize: '0.86rem' }}>
              <div>
                <h4 style={{ fontWeight: 600, color: '#111210', marginBottom: '4px' }}>AST Static Analysis</h4>
                <p style={{ color: '#696B66', lineHeight: 1.5 }}>
                  Exit Capsule inspects your codebase using Python&apos;s standard <code className="font-mono">ast</code> module. It never executes source files during inspection, completely avoiding malicious setup scripts.
                </p>
              </div>

              <div>
                <h4 style={{ fontWeight: 600, color: '#111210', marginBottom: '4px' }}>Deterministic 10-Point Verification</h4>
                <p style={{ color: '#696B66', lineHeight: 1.5 }}>
                  Verification tests wheel existence on PyPI, target Python compatibility, signature parity, isolated virtualenv smoke tests, and executes your project&apos;s regression tests in clean environments.
                </p>
              </div>

              <div>
                <h4 style={{ fontWeight: 600, color: '#111210', marginBottom: '4px' }}>Local Execution Commands</h4>
                <pre style={{
                  background: '#F5F6F3',
                  padding: '12px',
                  borderRadius: '4px',
                  border: '1px solid #E7E8E3',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.78rem',
                  color: '#111210'
                }}>
{`# Start backend
cd backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload

# Start frontend
cd frontend
npm run dev`}
                </pre>
              </div>
            </div>

            <div style={{
              padding: '14px 20px',
              borderTop: '1px solid #E7E8E3',
              background: '#FAFAF8',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '10px'
            }}>
              <button
                onClick={() => setDocsModalOpen(false)}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E7E8E3',
                  borderRadius: '4px',
                  padding: '6px 14px',
                  fontSize: '0.82rem',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
              <button
                onClick={() => { setDocsModalOpen(false); onAnalyzeRepo(); }}
                style={{
                  background: '#111210',
                  color: '#FAFAF8',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '6px 14px',
                  fontSize: '0.82rem',
                  cursor: 'pointer'
                }}
              >
                Open Workspace &rarr;
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
