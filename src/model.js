export const people = [
  { id: 'ada', label: 'Ada Lovelace', detail: 'Product designer', group: 'Design', initials: 'AL' },
  { id: 'grace', label: 'Grace Hopper', detail: 'Design engineer', group: 'Design', initials: 'GH' },
  { id: 'margaret', label: 'Margaret Hamilton', detail: 'Engineering lead', group: 'Engineering', initials: 'MH' },
  { id: 'alan', label: 'Alan Turing', detail: 'Software engineer', group: 'Engineering', initials: 'AT' },
  { id: 'katherine', label: 'Katherine Johnson', detail: 'Data analyst', group: 'Research', initials: 'KJ' },
];

export const disciplines = [
  { id: 'product', label: 'Product design' },
  { id: 'engineering', label: 'Engineering' },
  { id: 'research', label: 'Research' },
  { id: 'content', label: 'Content design' },
  { id: 'strategy', label: 'Strategy' },
];

export const families = [
  { id: 'radio', name: 'Radio group', count: 'single', number: '01', summary: 'One choice. All options in sight.', use: 'A short set that benefits from comparison.', useCases: [
    'Delivery options: compare standard, express, or pickup.',
    'Billing cycle: choose monthly or yearly payments.',
    'Profile visibility: choose public or private.',
  ], search: 'None', custom: false, visibility: 'Always visible', primitive: 'Native radio inputs', docs: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/radio' },
  { id: 'checkbox', name: 'Checkbox group', count: 'multiple', number: '02', summary: 'Independent choices, visible together.', use: 'A manageable set of non-exclusive choices.', useCases: [
    'Notification channels: enable email, SMS, and push independently.',
    'Newsletter topics: select several interests from a short list.',
    'Order extras: add gift wrapping and a gift message.',
  ], search: 'None', custom: false, visibility: 'Always visible', primitive: 'Native checkbox inputs', docs: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/checkbox' },
  { id: 'select', name: 'Select', count: 'single', number: '03', summary: 'One value, tucked behind a trigger.', use: 'People browse a known set; the button shows the selected value. Search can help with a long list.', useCases: [
    'Country selector: browse a country list, with optional search in the popover.',
    'Preferred language: choose one supported language.',
    'Default currency: choose the currency used for prices.',
  ], search: 'Optional, inside the popover', custom: false, visibility: 'On demand', primitive: 'Headless UI Listbox', docs: 'https://headlessui.com/react/listbox' },
  { id: 'multi-select', name: 'Multi-select', count: 'multiple', number: '04', summary: 'Several values. No editable field.', use: 'People browse a known set; the button summarizes selected values. Search can help with a long list.', useCases: [
    'Article tags: browse and select several predefined tags.',
    'Product filters: include several brands in the results.',
    'Team roles: select several roles from a known set.',
  ], search: 'Optional, inside the popover', custom: false, visibility: 'On demand', primitive: 'Headless UI Listbox, multiple', docs: 'https://headlessui.com/react/listbox' },
  { id: 'combobox', name: 'Combobox', count: 'single', number: '05', summary: 'Type to find one existing value.', use: 'People know what they want and prefer to type directly in the value field.', useCases: [
    'Country selector: type a country name and select a match.',
    'Project owner: search a member directory for one person.',
    'Customer lookup: find and select an existing customer.',
  ], search: 'In the value field', custom: false, visibility: 'On demand', primitive: 'Headless UI Combobox', docs: 'https://headlessui.com/react/combobox' },
  { id: 'multi-combobox', name: 'Multi-value combobox', count: 'multiple', number: '06', summary: 'Search, select, and collect values.', use: 'People type directly to find several existing values, shown as pills or another summary.', useCases: [
    'Member list selection: search for and add several project members.',
    'Email recipients: search an address book for existing contacts.',
    'Related articles: find and link several published articles.',
  ], search: 'In the value field', custom: false, visibility: 'On demand', primitive: 'Headless UI Combobox, multiple', docs: 'https://headlessui.com/react/combobox' },
  { id: 'tags', name: 'Tags input', count: 'multiple', number: '07', summary: 'Turn free-form text into discrete values.', use: 'Custom entries without an option catalogue.', useCases: [
    'Article tags: enter free-form keywords without a predefined list.',
    'Email addresses: enter or paste recipients; validate each address.',
    'Search keywords: collect several custom terms for a saved alert.',
  ], search: 'No suggestions', custom: true, visibility: 'No option list', primitive: 'React + dnd-kit composition', docs: 'https://docs.dndkit.com/' },
  { id: 'creatable', name: 'Creatable combobox', count: 'both', number: '08', summary: 'Choose something known. Or create it.', use: 'Existing suggestions plus explicit creation of a new value.', useCases: [
    'Article tags: reuse suggested tags or explicitly create a new tag.',
    'Issue labels: select existing labels or create one when permitted.',
    'Profile skills: choose suggested skills or add a missing skill.',
  ], search: 'In the value field', custom: true, visibility: 'On demand', primitive: 'Headless UI Combobox + create option', docs: 'https://headlessui.com/react/combobox' },
];

export const fileActions = ['Save', 'Print', 'Options', 'Exit'];

export const exampleFamilies = [
  { id: 'menu', name: 'Action menu', count: 'none', number: '00', summary: 'Run a command. Do not select a form value.', use: `File menu commands: ${fileActions.join(', ')}.`, useCases: [
    'File commands: save, print, or exit.',
    'Item actions: edit, duplicate, or archive a record.',
    'Account actions: open settings or sign out.',
  ], custom: false, visibility: 'On demand', primitive: 'Headless UI Menu', docs: 'https://headlessui.com/react/menu' },
  ...families,
];

export function filterOptions(options, query) {
  const search = query.trim().toLocaleLowerCase();
  return options.filter(option =>
    `${option.label} ${option.detail ?? ''} ${option.group ?? ''}`.toLocaleLowerCase().includes(search),
  );
}

export function makeCustomValue(text, values) {
  const label = text.trim();
  if (!label) return { error: 'Enter a value before adding it.' };
  if (values.some(value => value.label.toLocaleLowerCase() === label.toLocaleLowerCase())) {
    return { error: `"${label}" has already been added.` };
  }
  return { value: { id: `custom-${crypto.randomUUID()}`, label, custom: true } };
}

export function moveValue(values, index, direction) {
  const destination = index + direction;
  if (index < 0 || index >= values.length || destination < 0 || destination >= values.length) return values;
  const copy = [...values];
  const [moved] = copy.splice(index, 1);
  copy.splice(destination, 0, moved);
  return copy;
}

export const decisionTree = `flowchart TD
  START{"Does it hold a form value?"}
  START -->|No: invokes an action| ACTION["Action menu / MenuButton\\nFile: ${fileActions.join(', ')}\\nInvokes commands; no form value"]
  START -->|Yes| ENTRY{"How is a value entered?"}
  ENTRY -->|Free-form text| FREECOUNT{"One or multiple values?"}
  FREECOUNT -->|One| TEXT["Text Field\\nOptional autocomplete completions"]
  FREECOUNT -->|Multiple| TAGS["Tags / token input"]
  ENTRY -->|Choose from options| ALLOWCREATE{"Can people explicitly create an option?"}
  ALLOWCREATE -->|Yes| CREATECOUNT{"One or multiple values?"}
  CREATECOUNT -->|One| CREATEONE["Creatable combobox"]
  CREATECOUNT -->|Multiple| CREATEMULTI["Creatable multi-value combobox"]
  ALLOWCREATE -->|No: existing options only| VISIBLE{"Keep all options visible in the form?\\nOften useful for a short list"}
  VISIBLE -->|Yes| INLINECOUNT{"One or multiple values?"}
  INLINECOUNT -->|One| RADIO["Radio group"]
  INLINECOUNT -->|Multiple| CHECK["Checkbox group"]
  VISIBLE -->|No: open on demand| FIND{"How do people prefer to find options?"}
  FIND -->|Know it: type directly| COMBOCOUNT{"One or multiple values?"}
  COMBOCOUNT -->|One| COMBO["Combobox\\nSearch in value field"]
  COMBOCOUNT -->|Multiple| MULTICOMBO["Multi-value combobox\\nSearch in value field"]
  FIND -->|Browse; filter if helpful| SELECTCOUNT{"One or multiple values?"}
  SELECTCOUNT -->|One| SELECT["Select\\nValue on button\\nOptional search in popover"]
  SELECTCOUNT -->|Multiple| MULTISELECT["Multi-select\\nSummary on button\\nOptional search in popover"]
  classDef decision fill:#fff,stroke:#bdc9c2,color:#293d35,rx:10;
  classDef family fill:#e7f2eb,stroke:#79a98b,color:#174d35,rx:8;
  classDef action fill:#fbf2e8,stroke:#bd986a,color:#71512c,rx:8;
  classDef excluded fill:#f3f1ed,stroke:#ccc5ba,color:#766e63,rx:8;
  class START,ENTRY,FREECOUNT,ALLOWCREATE,CREATECOUNT,VISIBLE,INLINECOUNT,FIND,COMBOCOUNT,SELECTCOUNT decision;
  class TAGS,CREATEONE,CREATEMULTI,RADIO,CHECK,COMBO,MULTICOMBO,SELECT,MULTISELECT family;
  class ACTION action;
  class TEXT excluded;
`;
