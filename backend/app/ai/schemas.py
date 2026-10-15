from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class APIDifference(BaseModel):
    original_api: str = Field(..., description="The original API or import used, e.g. requests.get()")
    replacement_api: str = Field(..., description="The replacement API or import, e.g. httpx.get()")
    notes: Optional[str] = Field(None, description="Explanation of differences or parameter shifts")

class GemmaMigrationProposal(BaseModel):
    schema_version: str = Field(default="1.0.0", description="Schema version of the proposal")
    dependency: str = Field(..., description="Name of the dependency being replaced")
    risk_summary: str = Field(..., description="Summary of risks associated with the dependency")
    candidate_replacement: str = Field(..., description="Proposed replacement package name")
    reasons: List[str] = Field(..., description="Detailed reasons supporting this replacement")
    proposed_migration_steps: List[str] = Field(..., description="Step-by-step migration guide")
    expected_api_differences: List[APIDifference] = Field(default_factory=list, description="Expected API changes")
    relevant_source_locations: List[str] = Field(default_factory=list, description="Files and locations affected")
    potential_compatibility_problems: List[str] = Field(default_factory=list, description="Potential edge-case issues")
    suggested_tests: List[str] = Field(default_factory=list, description="Tests to verify replacement functionality")
    estimated_migration_difficulty: str = Field(..., description="Estimated difficulty: LOW, MEDIUM, or HIGH")
    confidence_explanation: str = Field(..., description="Explanation of model confidence and reasoning")
    assumptions_and_unknowns: List[str] = Field(default_factory=list, description="Assumptions made by the model")

    class Config:
        extra = "ignore"
