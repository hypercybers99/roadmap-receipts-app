export interface ContractErrorMapping {
  template: string;
  contract: 'RoadmapLedger' | 'TrancheGate';
  plainMessage: string;
  nextStep: string;
}

export const CONTRACT_ERRORS: ContractErrorMapping[] = [
  // --- RoadmapLedger Errors (31 unique templates) ---
  {
    template: 'bad milestone {idx} criteria: must be a list of 1 to 4 items',
    contract: 'RoadmapLedger',
    plainMessage: 'The milestone must contain between 1 and 4 evaluation criteria.',
    nextStep: 'Ensure criteria has at least 1 and at most 4 items.',
  },
  {
    template: 'bad milestone {idx} criterion {c_idx}: length must be between 10 and 160 characters',
    contract: 'RoadmapLedger',
    plainMessage: 'A milestone criterion statement is too short or too long.',
    nextStep: 'Adjust criterion length between 10 and 160 characters.',
  },
  {
    template: 'bad milestone {idx} criterion {c_idx}: must be ASCII printable',
    contract: 'RoadmapLedger',
    plainMessage: 'A milestone criterion contains non-ASCII or non-printable characters.',
    nextStep: 'Use standard ASCII characters in criterion text.',
  },
  {
    template: 'bad milestone {idx} title: length must be between 5 and 80 characters',
    contract: 'RoadmapLedger',
    plainMessage: 'The milestone title length is out of allowed boundaries.',
    nextStep: 'Provide a milestone title between 5 and 80 characters long.',
  },
  {
    template: 'bad milestone {idx} title: must be ASCII printable',
    contract: 'RoadmapLedger',
    plainMessage: 'The milestone title contains unsupported characters.',
    nextStep: 'Use standard ASCII characters in milestone titles.',
  },
  {
    template: 'bad milestone {idx} weight: must be an integer',
    contract: 'RoadmapLedger',
    plainMessage: 'The milestone weight is not a valid integer number.',
    nextStep: 'Enter an integer weight for each milestone.',
  },
  {
    template: 'bad milestone {idx} weight: must be between 1 and 10',
    contract: 'RoadmapLedger',
    plainMessage: 'The milestone weight must be between 1 and 10 points.',
    nextStep: 'Set milestone weight between 1 and 10.',
  },
  {
    template: 'bad milestone {idx}: keys must exactly match title, criteria, weight, evidence_url',
    contract: 'RoadmapLedger',
    plainMessage: 'Milestone object contains extra or missing fields.',
    nextStep: 'Include exactly title, criteria, weight, and evidence_url keys.',
  },
  {
    template: 'bad milestone {idx}: must be an object',
    contract: 'RoadmapLedger',
    plainMessage: 'A milestone entry is not a JSON object.',
    nextStep: 'Format each milestone as a JSON dictionary object.',
  },
  {
    template: 'bad milestones JSON: invalid JSON syntax',
    contract: 'RoadmapLedger',
    plainMessage: 'The milestones JSON string cannot be parsed as valid JSON.',
    nextStep: 'Check JSON formatting, quotes, and commas.',
  },
  {
    template: 'bad milestones JSON: must be a JSON array',
    contract: 'RoadmapLedger',
    plainMessage: 'The milestones parameter must be a JSON array list of milestones.',
    nextStep: 'Wrap milestones in a top-level JSON array [].',
  },
  {
    template: 'bad milestones count: must have between 1 and 6 milestones',
    contract: 'RoadmapLedger',
    plainMessage: 'Roadmaps must specify between 1 and 6 milestones.',
    nextStep: 'Define between 1 and 6 milestones in the roadmap.',
  },
  {
    template: 'bad roadmap name: length must be between 3 and 60 characters',
    contract: 'RoadmapLedger',
    plainMessage: 'The roadmap project name is too short or too long.',
    nextStep: 'Provide a roadmap name between 3 and 60 characters.',
  },
  {
    template: 'bad roadmap name: must be ASCII printable',
    contract: 'RoadmapLedger',
    plainMessage: 'The roadmap name contains non-ASCII characters.',
    nextStep: 'Use standard ASCII characters for roadmap name.',
  },
  {
    template: 'duplicate observation: already recorded in verification {existing_vid}',
    contract: 'RoadmapLedger',
    plainMessage: 'An observation for this exact URL content hash has already been verified.',
    nextStep: 'Update evidence URL to a new release or document if evidence changed.',
  },
  {
    template: 'evidence URL exceeds 300 characters',
    contract: 'RoadmapLedger',
    plainMessage: 'The evidence URL string is longer than the 300-character limit.',
    nextStep: 'Shorten URL path or host name under 300 characters.',
  },
  {
    template: 'evidence URL host must be a valid public domain name',
    contract: 'RoadmapLedger',
    plainMessage: 'Evidence URL domain is not a valid public domain name.',
    nextStep: 'Use a public fully qualified domain name (e.g. raw.githubusercontent.com).',
  },
  {
    template: 'evidence URL host must not be an IP literal',
    contract: 'RoadmapLedger',
    plainMessage: 'IP literal addresses are prohibited for evidence hosting.',
    nextStep: 'Use a registered public domain name instead of an IP address.',
  },
  {
    template: 'evidence URL missing valid host',
    contract: 'RoadmapLedger',
    plainMessage: 'The evidence URL does not have a recognizable host portion.',
    nextStep: 'Provide a complete https URL including host name.',
  },
  {
    template: 'evidence URL must be a string',
    contract: 'RoadmapLedger',
    plainMessage: 'Evidence URL must be provided as text.',
    nextStep: 'Pass evidence URL as a string.',
  },
  {
    template: 'evidence URL must not contain fragment',
    contract: 'RoadmapLedger',
    plainMessage: 'URL fragments (#hash) are not allowed in evidence links.',
    nextStep: 'Remove the fragment (#...) from the URL.',
  },
  {
    template: 'evidence URL must not contain query parameters',
    contract: 'RoadmapLedger',
    plainMessage: 'Query parameters (?key=val) are not allowed in evidence links.',
    nextStep: 'Use a clean static URL path without query parameters.',
  },
  {
    template: 'evidence URL must not contain userinfo',
    contract: 'RoadmapLedger',
    plainMessage: 'Credentials or userinfo in URLs (user:pass@) are forbidden.',
    nextStep: 'Remove authentication credentials from URL.',
  },
  {
    template: 'evidence URL must use https scheme',
    contract: 'RoadmapLedger',
    plainMessage: 'Only secure https:// URLs are permitted.',
    nextStep: 'Ensure evidence URL starts with https://.',
  },
  {
    template: 'evidence URL path must not contain dot-segments or encoded traversal',
    contract: 'RoadmapLedger',
    plainMessage: 'Path traversal segments (..) are forbidden in evidence URLs.',
    nextStep: 'Provide a normalized static path without traversal tokens.',
  },
  {
    template: 'evidence URL port must be 443 or omitted',
    contract: 'RoadmapLedger',
    plainMessage: 'Custom network ports are forbidden; only port 443 is accepted.',
    nextStep: 'Remove custom port from evidence URL.',
  },
  {
    template: 'host or directory mismatch',
    contract: 'RoadmapLedger',
    plainMessage: 'Evidence URL update must stay within the registered host and directory path.',
    nextStep: 'Update only the filename within the same directory path.',
  },
  {
    template: 'milestone index out of range',
    contract: 'RoadmapLedger',
    plainMessage: 'The requested milestone index does not exist on this roadmap.',
    nextStep: 'Select a valid milestone index within 0 to milestone_count - 1.',
  },
  {
    template: 'mixed hosts: all milestones must share the same evidence host',
    contract: 'RoadmapLedger',
    plainMessage: 'All milestones in a roadmap must share the identical evidence domain host.',
    nextStep: 'Host all milestone evidence documents on the same domain.',
  },
  {
    template: 'not roadmap owner',
    contract: 'RoadmapLedger',
    plainMessage: 'Only the original creator address can update evidence URLs.',
    nextStep: 'Connect the roadmap creator wallet address.',
  },
  {
    template: 'unknown roadmap',
    contract: 'RoadmapLedger',
    plainMessage: 'No roadmap was found with the specified roadmap ID.',
    nextStep: 'Verify roadmap ID exists in the ledger.',
  },

  // --- TrancheGate Errors (28 unique templates) ---
  {
    template: 'already claimed demo credits',
    contract: 'TrancheGate',
    plainMessage: 'This account has already claimed its one-time demo credits allocation.',
    nextStep: 'Each account can claim demo credits once.',
  },
  {
    template: 'bad tranche {idx} amount: must be an integer',
    contract: 'TrancheGate',
    plainMessage: 'Tranche funding amount must be an integer.',
    nextStep: 'Provide an integer credit amount for the tranche.',
  },
  {
    template: 'bad tranche {idx} amount: must be positive',
    contract: 'TrancheGate',
    plainMessage: 'Tranche credit amount must be greater than zero.',
    nextStep: 'Allocate at least 1 credit unit to each tranche.',
  },
  {
    template: 'bad tranche {idx} milestone_index: must be an integer',
    contract: 'TrancheGate',
    plainMessage: 'Tranche milestone index must be an integer.',
    nextStep: 'Select a valid milestone number.',
  },
  {
    template: 'bad tranche {idx} milestone_index: out of roadmap range',
    contract: 'TrancheGate',
    plainMessage: 'Tranche milestone index does not exist in target roadmap.',
    nextStep: 'Choose a milestone index within roadmap range.',
  },
  {
    template: 'bad tranche {idx}: keys must exactly match milestone_index and amount',
    contract: 'TrancheGate',
    plainMessage: 'Tranche object has invalid keys.',
    nextStep: 'Include only milestone_index and amount in each tranche.',
  },
  {
    template: 'bad tranche {idx}: must be an object',
    contract: 'TrancheGate',
    plainMessage: 'Tranche entry must be a JSON object.',
    nextStep: 'Format each tranche as a dictionary.',
  },
  {
    template: 'bad tranches JSON: invalid JSON syntax',
    contract: 'TrancheGate',
    plainMessage: 'Tranches JSON string is malformed.',
    nextStep: 'Check JSON syntax and formatting.',
  },
  {
    template: 'bad tranches JSON: must be a list',
    contract: 'TrancheGate',
    plainMessage: 'Tranches parameter must be a JSON array.',
    nextStep: 'Wrap tranches in an array list [].',
  },
  {
    template: 'bad tranches count: must have between 1 and 6 tranches',
    contract: 'TrancheGate',
    plainMessage: 'A grant must specify between 1 and 6 tranches.',
    nextStep: 'Define between 1 and 6 tranches.',
  },
  {
    template: 'cannot reclaim: milestone status is {curr_status.lower()}',
    contract: 'TrancheGate',
    plainMessage: 'Funds can only be reclaimed when the milestone is verified MISSED.',
    nextStep: 'Milestone must resolve to MISSED status before funder can reclaim.',
  },
  {
    template: 'duplicate milestone_index {m_idx} in tranches',
    contract: 'TrancheGate',
    plainMessage: 'Multiple tranches cannot target the same milestone index.',
    nextStep: 'Assign each milestone index to at most one tranche.',
  },
  {
    template: 'insufficient balance to fund grant tranches',
    contract: 'TrancheGate',
    plainMessage: 'Account demo credit balance is insufficient for total grant amount.',
    nextStep: 'Claim demo credits or reduce tranche amounts.',
  },
  {
    template: 'invalid recipient address format',
    contract: 'TrancheGate',
    plainMessage: 'Recipient address is not a valid 42-character 0x hex address.',
    nextStep: 'Provide a valid 0x recipient wallet address.',
  },
  {
    template: 'milestone not delivered: missed',
    contract: 'TrancheGate',
    plainMessage: 'Cannot release tranche: milestone status is MISSED.',
    nextStep: 'Funder can reclaim this tranche credits.',
  },
  {
    template: 'milestone not delivered: partial',
    contract: 'TrancheGate',
    plainMessage: 'Cannot release tranche: milestone status is PARTIAL.',
    nextStep: 'Evidence must be updated and re-verified to DELIVERED before release.',
  },
  {
    template: 'milestone not delivered: pending',
    contract: 'TrancheGate',
    plainMessage: 'Cannot release tranche: milestone has not yet been verified.',
    nextStep: 'Invoke verify() on this milestone first.',
  },
  {
    template: 'milestone not delivered: review needed',
    contract: 'TrancheGate',
    plainMessage: 'Cannot release tranche: milestone status is REVIEW.',
    nextStep: 'Check evidence document for safety tripwires or ambiguities.',
  },
  {
    template: 'milestone not delivered: {curr_status.lower()}',
    contract: 'TrancheGate',
    plainMessage: 'Tranche can only be released when milestone is DELIVERED.',
    nextStep: 'Milestone must be verified DELIVERED before tranche release.',
  },
  {
    template: 'milestone not found in ledger',
    contract: 'TrancheGate',
    plainMessage: 'Target milestone index does not exist in bound ledger.',
    nextStep: 'Select an existing milestone from target roadmap.',
  },
  {
    template: 'not grant funder',
    contract: 'TrancheGate',
    plainMessage: 'Only the original grant funder can reclaim missed tranches.',
    nextStep: 'Connect the funder wallet address.',
  },
  {
    template: 'recipient cannot be funder',
    contract: 'TrancheGate',
    plainMessage: 'Funder address cannot be the same as the recipient address.',
    nextStep: 'Specify a different recipient address.',
  },
  {
    template: 'roadmap changed since grant creation',
    contract: 'TrancheGate',
    plainMessage: 'Milestones specification hash in ledger changed since grant creation.',
    nextStep: 'Grant tranches are strictly bound to original roadmap specification hash.',
  },
  {
    template: 'roadmap does not exist in ledger',
    contract: 'TrancheGate',
    plainMessage: 'The referenced roadmap ID does not exist in RoadmapLedger.',
    nextStep: 'Select an active roadmap registered in the ledger.',
  },
  {
    template: 'tranche already reclaimed',
    contract: 'TrancheGate',
    plainMessage: 'This tranche has already been reclaimed by the funder.',
    nextStep: 'No further action can be taken on a reclaimed tranche.',
  },
  {
    template: 'tranche already released',
    contract: 'TrancheGate',
    plainMessage: 'This tranche has already been released to the recipient.',
    nextStep: 'No further action can be taken on an already released tranche.',
  },
  {
    template: 'tranche index out of range',
    contract: 'TrancheGate',
    plainMessage: 'The specified tranche index does not exist in this grant.',
    nextStep: 'Select a valid tranche index.',
  },
  {
    template: 'unknown grant',
    contract: 'TrancheGate',
    plainMessage: 'No grant found with the specified grant ID.',
    nextStep: 'Verify grant ID exists in TrancheGate.',
  },
];

function templateToRegex(tpl: string): RegExp {
  const escaped = tpl
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    .replace(/\\\{[^}]+\\\}/g, '.*');
  return new RegExp(`^${escaped}$`, 'i');
}

export function lookupError(rawError: string): {
  template: string;
  contract: 'RoadmapLedger' | 'TrancheGate';
  plainMessage: string;
  nextStep: string;
} {
  const clean = (rawError || '').trim();

  // Try exact match first
  for (const item of CONTRACT_ERRORS) {
    if (item.template.toLowerCase() === clean.toLowerCase()) {
      return item;
    }
  }

  // Try regex template match
  for (const item of CONTRACT_ERRORS) {
    const rx = templateToRegex(item.template);
    if (rx.test(clean)) {
      return item;
    }
  }

  // Fallback
  return {
    template: 'unknown error',
    contract: 'RoadmapLedger',
    plainMessage: clean || 'An unspecified transaction error occurred.',
    nextStep: 'Check transaction details and inspect contract constraints.',
  };
}
