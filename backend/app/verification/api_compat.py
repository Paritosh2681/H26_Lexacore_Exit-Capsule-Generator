from typing import List, Dict, Any, Set, Tuple

def compare_api_usage(
    observed_symbols: Set[str],
    candidate_exported_symbols: Set[str]
) -> Dict[str, Any]:
    """
    Compare observed API symbols from the original dependency against
    the available exported symbols of the candidate replacement.
    """
    if not observed_symbols:
        return {
            "compatible": True,
            "matched_symbols": [],
            "missing_symbols": [],
            "coverage_pct": 100.0,
            "notes": "No specific function or class symbols were directly imported."
        }

    matched = observed_symbols.intersection(candidate_exported_symbols)
    missing = observed_symbols.difference(candidate_exported_symbols)
    coverage = round((len(matched) / len(observed_symbols)) * 100.0, 1) if observed_symbols else 100.0

    return {
        "compatible": len(missing) == 0,
        "matched_symbols": sorted(list(matched)),
        "missing_symbols": sorted(list(missing)),
        "coverage_pct": coverage,
        "notes": f"Matched {len(matched)} of {len(observed_symbols)} observed symbols ({coverage}%)."
    }
