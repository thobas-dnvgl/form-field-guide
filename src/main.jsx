import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy, sortableKeyboardCoordinates, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Combobox, ComboboxInput, ComboboxButton, ComboboxOptions, ComboboxOption,
  Listbox, ListboxButton, ListboxOptions, ListboxOption,
  Popover, PopoverButton, PopoverPanel,
  Menu, MenuButton, MenuItems, MenuItem,
} from '@headlessui/react';
import {
  ArrowUpRight, BookOpen, Braces,
  Check, ChevronDown, Code2, Download, GitBranch, GripVertical, LayoutGrid,
  Minus, Plus, Search, SlidersHorizontal, X,
} from 'lucide-react';
import { decisionTree, disciplines, exampleFamilies, families, fileActions, filterOptions, makeCustomValue, moveValue, people } from './model';
import '@fontsource-variable/gantari';
import './styles.css';

const navigation = [
  { id: 'examples', label: 'Component explorer', icon: LayoutGrid },
  { id: 'tree', label: 'Decision tree', icon: GitBranch },
  { id: 'taxonomy', label: 'Taxonomy', icon: BookOpen },
];

function Badge({ children, warm = false }) {
  return <span className={`badge ${warm ? 'badge-warm' : ''}`}>{children}</span>;
}

function Pill({ value, onRemove, children }) {
  return <span className="pill"><span>{value.label}</span>{children}
    {onRemove && <button type="button" aria-label={`Remove ${value.label}`} onClick={onRemove}><X size={12} /></button>}
  </span>;
}

function SortablePill({ value, onRemove }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id: value.id });
  return <span ref={setNodeRef} className={`pill sortable-pill ${isDragging ? 'is-dragging' : ''}`} style={{ transform: CSS.Transform.toString(transform), transition }}>
    <button ref={setActivatorNodeRef} type="button" className="pill-drag-handle" {...attributes} {...listeners} aria-label={`Reorder ${value.label}`}>
      <GripVertical size={12} aria-hidden="true" /><span>{value.label}</span>
    </button>
    <button type="button" aria-label={`Remove ${value.label}`} onClick={onRemove}><X size={12} /></button>
  </span>;
}

function ValueInspector({ value }) {
  return <details className="value-inspector">
    <summary><Braces size={13} /><span>Inspect value</span><span className="ml-auto">{Array.isArray(value) ? `${value.length} objects` : value ? '1 object' : 'null'}</span></summary>
    <pre aria-label="Current committed value">{JSON.stringify(value, null, 2)}</pre>
  </details>;
}

function triggerText(value, multiple) {
  return multiple ? (value.length ? `${value.length} disciplines selected` : 'Choose disciplines') : value?.label ?? 'Choose a discipline';
}

function PopoverSearchSelect({ options, value, onChange, multiple = false, label }) {
  const [query, setQuery] = useState('');
  const visible = filterOptions(options, query);
  return <Popover className="relative">
    <PopoverButton aria-label={label} className="field flex w-full items-center justify-between gap-3 text-left">
      <span className={!value || (multiple && !value.length) ? 'text-stone-400' : ''}>{triggerText(value, multiple)}</span>
      <ChevronDown size={16} className="text-stone-400" />
    </PopoverButton>
    <PopoverPanel anchor="bottom start" className="options popover-search">
      {({ close }) => <Combobox value={value} multiple={multiple} by="id" onChange={next => { onChange(next); if (!multiple) { setQuery(''); close(); } }}>
        <div className="popover-search-field"><Search size={14} className="text-stone-400" />
          <ComboboxInput autoFocus aria-label={`Search ${label.toLowerCase()}`} placeholder="Search…" className="w-full bg-transparent text-sm outline-none" value={query} onChange={event => setQuery(event.target.value)} onKeyDown={event => { if (event.key === 'Escape') { event.preventDefault(); setQuery(''); close(); } }} />
        </div>
        <ComboboxOptions static className="outline-none">
          {visible.map(option => <ComboboxOption key={option.id} value={option} className="option group">
            <span className="option-check"><Check size={14} /></span><span>{option.label}</span>
          </ComboboxOption>)}
          {!visible.length && <p className="px-2.5 py-3 text-xs text-stone-500">No disciplines match “{query}”.</p>}
        </ComboboxOptions>
      </Combobox>}
    </PopoverPanel>
  </Popover>;
}

function ListSelect({ options, value, onChange, multiple = false, label, searchable = false }) {
  if (searchable) return <PopoverSearchSelect options={options} value={value} onChange={onChange} multiple={multiple} label={label} />;
  return <Listbox value={value} onChange={onChange} multiple={multiple} by="id">
    <div className="relative">
      <ListboxButton aria-label={label} className="field flex w-full items-center justify-between gap-3 text-left">
        <span className={!value || (multiple && !value.length) ? 'text-stone-400' : ''}>
          {triggerText(value, multiple)}
        </span><ChevronDown size={16} className="text-stone-400" />
      </ListboxButton>
      <ListboxOptions anchor="bottom start" className="options">
        {options.map(option => <ListboxOption key={option.id} value={option} className="option group">
          <span className="option-check"><Check size={14} /></span><span>{option.label}</span>
        </ListboxOption>)}
      </ListboxOptions>
    </div>
  </Listbox>;
}

function SearchSelect({ value, onChange, multiple = false, creatable = false, rich = false, label, options = people }) {
  const [query, setQuery] = useState('');
  const [created, setCreated] = useState([]);
  const available = [...options, ...created];
  const filtered = filterOptions(available, query);
  const exactMatch = available.some(option => option.label.toLocaleLowerCase() === query.trim().toLocaleLowerCase());
  const custom = creatable && query.trim() && !exactMatch ? { id: '__create', label: query.trim(), custom: true } : null;
  const selected = multiple ? value : value ? [value] : [];
  function choose(next) {
    const creation = multiple ? next.find(option => option.id === '__create') : next?.id === '__create' ? next : null;
    if (creation) {
      const result = makeCustomValue(creation.label, available);
      if (result.error) {
        setError(result.error);
        return;
      }
      setCreated(previous => [...previous, result.value]);
      onChange(multiple ? next.map(option => option.id === '__create' ? result.value : option) : result.value);
    } else onChange(next);
    setQuery('');
    setError('');
  }
  const [error, setError] = useState('');
  return <div>
    <Combobox value={value} onChange={choose} multiple={multiple} by="id" onClose={() => setQuery('')}>
      <div className={`field flex flex-wrap items-center gap-1.5 ${multiple ? 'min-h-12' : ''}`}>
        {multiple && selected.map(option => <Pill key={option.id} value={option} onRemove={() => onChange(value.filter(item => item.id !== option.id))} />)}
        {!multiple && <Search size={16} className="shrink-0 text-stone-400" />}
        <ComboboxInput aria-label={label} placeholder={multiple ? 'Search to add...' : creatable ? 'Find or create a label...' : 'Search people...'}
          displayValue={option => multiple ? '' : option?.label ?? ''}
          onChange={event => setQuery(event.target.value)} className="min-w-24 flex-1 outline-none"
        />
        <ComboboxButton aria-label={`Show options for ${label}`} className="text-stone-400"><ChevronDown size={16} /></ComboboxButton>
      </div>
      <ComboboxOptions anchor="bottom start" className="options" aria-label={`${label} options`}>
        {filtered.length === 0 && !custom && <div className="p-3 text-sm text-stone-500">No matching options.</div>}
        {filtered.map((option, index) => <React.Fragment key={option.id}>
          {rich && option.group !== filtered[index - 1]?.group && <div className="option-group">{option.group}</div>}
          <ComboboxOption value={option} className="option group">
            {rich && <span className={`avatar avatar-${index % 3}`}>{option.initials}</span>}
            <span className="flex-1"><span className="block">{option.label}</span>{rich && <span className="block text-xs text-stone-500">{option.detail}</span>}</span>
            <span className="option-check"><Check size={14} /></span>
          </ComboboxOption>
        </React.Fragment>)}
        {custom && <ComboboxOption value={custom} className="option border-t border-stone-100 text-emerald-800"><Plus size={15} />Create "{custom.label}"</ComboboxOption>}
      </ComboboxOptions>
    </Combobox>
    {error && <p className="mt-2 text-xs text-red-700" role="alert">{error}</p>}
  </div>;
}

function TagsInput({ value, onChange, reorderable = false, label = 'Custom labels' }) {
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef(null);
  const errorId = useId();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const accessibility = {
    screenReaderInstructions: {
      draggable: 'To reorder a tag, press Space or Enter to pick it up. Use the arrow keys to move it. Press Space or Enter to drop it, or Escape to cancel.',
    },
    announcements: {
      onDragStart: ({ active }) => `Picked up ${value.find(item => item.id === active.id)?.label}.`,
      onDragOver: ({ active, over }) => over
        ? `${value.find(item => item.id === active.id)?.label}, position ${value.findIndex(item => item.id === over.id) + 1} of ${value.length}.`
        : 'Outside the tag list.',
      onDragEnd: ({ active, over }) => over
        ? `Dropped ${value.find(item => item.id === active.id)?.label} at position ${value.findIndex(item => item.id === over.id) + 1} of ${value.length}.`
        : 'Reordering cancelled.',
      onDragCancel: () => 'Reordering cancelled.',
    },
  };
  function add(texts) {
    const next = [...value];
    const errors = [];
    for (const text of texts) {
      const result = makeCustomValue(text, next);
      if (result.error) errors.push(result.error);
      else next.push(result.value);
    }
    onChange(next);
    setError(errors.join(' '));
    setText(errors.length ? texts.filter(text => makeCustomValue(text, value).error).join(', ') : '');
  }
  const field = (
    <div className="field flex min-h-12 flex-wrap items-center gap-1.5">
      {value.map(option => {
        const Component = reorderable ? SortablePill : Pill;
        return <Component key={option.id} value={option} onRemove={() => onChange(value.filter(item => item.id !== option.id))} />;
      })}
      <input ref={inputRef} aria-label={label} aria-invalid={Boolean(error)} aria-describedby={error ? errorId : undefined}
        value={text} onChange={event => setText(event.target.value)} placeholder="Type a label..."
        className="min-w-24 flex-1 outline-none"
        onKeyDown={event => {
          if (event.nativeEvent.isComposing) return;
          if (event.key === 'Enter' || event.key === ',') { event.preventDefault(); add([text]); }
        }}
        onPaste={event => {
          const pasted = event.clipboardData.getData('text');
          if (/[,\n]/.test(pasted)) {
            event.preventDefault();
            add((text + pasted).split(/[,\n]+/).filter(part => part.trim()));
          }
        }}
      />
      <button type="button" aria-label="Add custom label" className="text-emerald-800" onClick={() => { add([text]); inputRef.current?.focus(); }}><Plus size={16} /></button>
    </div>
  );
  return <div>
    {reorderable ? <DndContext sensors={sensors} collisionDetection={closestCenter} accessibility={accessibility}
      onDragEnd={({ active, over }) => {
        if (!over || active.id === over.id) return;
        const from = value.findIndex(item => item.id === active.id);
        const to = value.findIndex(item => item.id === over.id);
        onChange(moveValue(value, from, to - from));
      }}>
      <SortableContext items={value.map(item => item.id)} strategy={rectSortingStrategy}>{field}</SortableContext>
    </DndContext> : field}
    <p className="mt-2 text-xs text-stone-500">Enter or comma to add. Paste a comma-separated list.{reorderable && ' Drag tags to reorder, or focus a tag and press Space, then use the arrow keys.'}</p>
    {error && <p id={errorId} role="alert" className="mt-2 text-xs text-red-700">{error}</p>}
  </div>;
}

const sourceExamples = {
  menu: `const [invocation, setInvocation] = useState({ action: '', count: 0 });\nconst actions = ['Save', 'Print', 'Options', 'Exit'];\n\nfunction runAction(action) {\n  setInvocation(previous => ({ action, count: previous.count + 1 }));\n}\n\n<Menu>\n  <MenuButton>File</MenuButton>\n  <MenuItems anchor="bottom start">\n    {actions.map(action => (\n      <MenuItem key={action}>\n        <button type="button" onClick={() => runAction(action)}>\n          {action}\n        </button>\n      </MenuItem>\n    ))}\n  </MenuItems>\n</Menu>\n\n// Demo feedback only. A real app invokes command handlers.\n// No value / onChange selection API; the trigger stays "File".`,
  radio: `<fieldset>\n  <legend>Delivery method</legend>\n  {methods.map(method => (\n    <label key={method.id}>\n      <input type="radio" name="delivery"\n        checked={value?.id === method.id}\n        onChange={() => setValue(method)} />\n      {method.label}\n    </label>\n  ))}\n</fieldset>`,
  checkbox: `{topics.map(topic => (\n  <label key={topic.id}>\n    <input type="checkbox"\n      checked={value.some(v => v.id === topic.id)}\n      onChange={e => setValue(e.target.checked\n        ? [...value, topic]\n        : value.filter(v => v.id !== topic.id))} />\n    {topic.label}\n  </label>\n))}`,
  select: `<Listbox value={value} onChange={setValue} by="id">\n  <ListboxButton>{value?.label ?? 'Choose'}</ListboxButton>\n  <ListboxOptions anchor="bottom start">\n    {options.map(option => (\n      <ListboxOption key={option.id} value={option}>\n        {option.label}\n      </ListboxOption>\n    ))}\n  </ListboxOptions>\n</Listbox>`,
  'multi-select': `<Listbox multiple by="id"\n  value={values} onChange={setValues}>\n  <ListboxButton>\n    {values.length} disciplines selected\n  </ListboxButton>\n  <ListboxOptions anchor="bottom start">\n    {options.map(option => (\n      <ListboxOption key={option.id} value={option}>\n        {option.label}\n      </ListboxOption>\n    ))}\n  </ListboxOptions>\n</Listbox>`,
  combobox: `<Combobox value={value} onChange={setValue} by="id">\n  <ComboboxInput\n    displayValue={person => person?.label ?? ''}\n    onChange={e => setQuery(e.target.value)} />\n  <ComboboxOptions anchor="bottom start">\n    {filterOptions(people, query).map(person => (\n      <ComboboxOption key={person.id} value={person}>\n        {person.label}\n      </ComboboxOption>\n    ))}\n  </ComboboxOptions>\n</Combobox>`,
  'popover-search': `<Popover>\n  <PopoverButton>{triggerText(value)}</PopoverButton>\n  <PopoverPanel anchor="bottom start">\n    {({ close }) => (\n      <Combobox by="id" value={value} multiple={multiple}\n        onChange={next => { setValue(next); if (!multiple) close(); }}>\n        <ComboboxInput autoFocus placeholder="Search…"\n          onChange={e => setQuery(e.target.value)} />\n        <ComboboxOptions static>\n          {filtered.map(option => (\n            <ComboboxOption key={option.id} value={option}>\n              {option.label}\n            </ComboboxOption>\n          ))}\n        </ComboboxOptions>\n      </Combobox>\n    )}\n  </PopoverPanel>\n</Popover>\n\n// The trigger is still a button showing the value.\n// The search text never becomes the value.`,
  'multi-combobox': `<SearchSelect multiple label="Project members"\n  value={members} onChange={setMembers} />\n\n// SearchSelect composes Headless UI's multiple\n// Combobox with removable Pills. Committed\n// state is Person[]; search text is separate.\n// See src/main.jsx for the full implementation.`,
  tags: `<TagsInput value={tags} onChange={setTags}\n  label="Custom labels" reorderable />\n\n// Local composition using dnd-kit for reordering.\n// Drag tags, or use Space + arrow keys + Space.\n// Enter/comma commits { id, label, custom: true }.\n// Blank and duplicate entries report an error.\n// See src/main.jsx for the full implementation.`,
  creatable: `<SearchSelect creatable multiple={multiple}\n  options={disciplines} label="Project labels"\n  value={value} onChange={setValue} />\n\n// Creation is an explicit option, not free-text\n// selection. New objects are local to this demo;\n// no shared catalogue is mutated or persisted.\n// See src/main.jsx for the full implementation.`,
};

function CommonUseCases({ family }) {
  const headingId = `use-cases-${family.id}`;
  return <section className="use-cases" aria-labelledby={headingId}>
    <h4 id={headingId}>Common use cases</h4>
    <ul>{family.useCases.map(useCase => <li key={useCase}>{useCase}</li>)}</ul>
  </section>;
}

function ActionMenuCard({ family, hidden = false }) {
  const [invocation, setInvocation] = useState({ action: '', count: 0 });
  const [showCode, setShowCode] = useState(false);
  return <article className="demo-card" id={`example-${family.id}`} hidden={hidden}>
    <div className="flex items-start justify-between gap-3"><span className="eyebrow">{family.number} / {family.visibility}</span><Badge warm>Actions / no value</Badge></div>
    <h3 className="mt-4 text-xl font-semibold tracking-tight">{family.name}</h3>
    <p className="mt-1 text-sm text-stone-500">{family.summary}</p>
    <div className="demo-surface">
      <span className="field-label">Application menu</span>
      <div>
        <Menu>
          <MenuButton className="field inline-flex items-center gap-8">File<ChevronDown size={16} className="text-stone-400" aria-hidden="true" /></MenuButton>
          <MenuItems anchor="bottom start" className="options action-menu">
            {fileActions.map(action => <MenuItem key={action}>
              <button type="button" className="option w-full text-left" onClick={() => setInvocation(previous => ({ action, count: previous.count + 1 }))}>{action}</button>
            </MenuItem>)}
          </MenuItems>
        </Menu>
      </div>
      <p role="status" aria-atomic="true" className="mt-3 text-xs text-stone-500">{invocation.count ? `Action ${invocation.count}: ${invocation.action} invoked.` : 'No action invoked yet.'}</p>
      <p className="mt-2 text-xs text-stone-500">Demo only: no files, settings, or windows are changed.</p>
    </div>
    <CommonUseCases family={family} />
    <div className="mt-auto">
      <div className="mt-4 flex items-center justify-between gap-2"><a href={family.docs} target="_blank" rel="noreferrer" className="text-xs text-stone-400 hover:text-emerald-700">{family.primitive}</a><button type="button" className={`code-toggle ${showCode ? 'text-emerald-800' : ''}`} onClick={() => setShowCode(!showCode)} aria-expanded={showCode}><Code2 size={14} />{showCode ? 'Hide React' : 'React example'}</button></div>
      {showCode && <pre className="code-block"><code>{sourceExamples.menu}</code></pre>}
    </div>
  </article>;
}

function DemoCard({ family, hidden = false }) {
  const defaults = { radio: { id: 'standard', label: 'Standard', detail: '3-5 business days' }, checkbox: [disciplines[0], disciplines[2]], select: disciplines[0], 'multi-select': [disciplines[0], disciplines[1]], combobox: null, 'multi-combobox': [people[0]], tags: [{ id: 'priority', label: 'Priority' }, { id: 'launch', label: 'Launch' }], creatable: [] };
  const [value, setValue] = useState(defaults[family.id]);
  const [showCode, setShowCode] = useState(false);
  const [multiple, setMultiple] = useState(true);
  const [searchable, setSearchable] = useState(false);
  const isListSelect = family.id === 'select' || family.id === 'multi-select';
  const id = useId();
  const methods = [{ id: 'standard', label: 'Standard', detail: '3-5 business days' }, { id: 'express', label: 'Express', detail: 'Next business day' }];
  const labels = { radio: 'Delivery method', checkbox: 'Areas of interest', select: 'Primary discipline', 'multi-select': 'Disciplines', combobox: 'Project owner', 'multi-combobox': 'Project members', tags: 'Project labels', creatable: 'Find or create project labels' };
  return <article className="demo-card" id={`example-${family.id}`} hidden={hidden}>
    <div className="flex items-start justify-between gap-3"><span className="eyebrow">{family.number} / {family.visibility}</span><Badge warm={family.custom}>{family.custom ? 'Custom values' : family.count === 'single' ? 'Single value' : 'Multiple values'}</Badge></div>
    <h3 className="mt-4 text-xl font-semibold tracking-tight">{family.name}</h3>
    <p className="mt-1 text-sm text-stone-500">{family.summary}</p>
    <div className="demo-surface">
      {family.id === 'radio' ? <fieldset><legend className="field-label">{labels.radio}</legend><div className="space-y-2.5">{methods.map(method => <label key={method.id} className="flex cursor-pointer items-center gap-3">
        <input type="radio" name={`delivery-${id}`} checked={value?.id === method.id} onChange={() => setValue(method)} /><span><span className="block text-sm font-medium">{method.label}</span><span className="text-xs text-stone-500">{method.detail}</span></span>
      </label>)}</div></fieldset> : family.id === 'checkbox' ? <fieldset><legend className="field-label">{labels.checkbox}</legend><div className="grid gap-3 sm:grid-cols-2">{disciplines.slice(0, 4).map(option => <label key={option.id} className="flex cursor-pointer items-center gap-2.5 text-sm">
        <input type="checkbox" checked={value.some(item => item.id === option.id)} onChange={event => setValue(event.target.checked ? [...value, option] : value.filter(item => item.id !== option.id))} />{option.label}
      </label>)}</div></fieldset> : <div>
        <div className="mb-2 flex items-center justify-between gap-2"><span className="field-label mb-0">{labels[family.id]}</span>
          {family.id === 'creatable' && <label className="flex items-center gap-1.5 text-xs text-stone-500"><input type="checkbox" checked={multiple} onChange={event => { setMultiple(event.target.checked); setValue(event.target.checked ? [] : null); }} />Multiple</label>}
                    {isListSelect && <label className="flex items-center gap-1.5 text-xs text-stone-500"><input type="checkbox" checked={searchable} onChange={event => setSearchable(event.target.checked)} />Search in popover</label>}
                  </div>
                  {family.id === 'select' && <ListSelect searchable={searchable} options={disciplines} value={value} onChange={setValue} label={labels.select} />}
                  {family.id === 'multi-select' && <ListSelect searchable={searchable} multiple options={disciplines} value={value} onChange={setValue} label={labels['multi-select']} />}
                  {isListSelect && searchable && <p className="mt-2 text-xs text-stone-500">The field stays a button. Search lives in the popover and only filters the list.</p>}
        {family.id === 'combobox' && <SearchSelect value={value} onChange={setValue} label={labels.combobox} rich />}
        {family.id === 'multi-combobox' && <SearchSelect multiple value={value} onChange={setValue} label={labels['multi-combobox']} />}
        {family.id === 'tags' && <TagsInput value={value} onChange={setValue} label={labels.tags} reorderable />}
        {family.id === 'creatable' && <SearchSelect key={multiple ? 'multiple' : 'single'} multiple={multiple} creatable options={disciplines} value={value} onChange={setValue} label={labels.creatable} />}
        {family.id === 'combobox' && <p className="mt-2 text-xs text-stone-500">Grouped options with roles. Existing people only.</p>}
        {family.id === 'multi-select' && <p className="mt-2 text-xs text-stone-500">Checkmarks in the list. A count in the field. No pills required.</p>}
        {family.id === 'creatable' && <p className="mt-2 text-xs text-stone-500">New labels are local objects, not saved to a shared catalogue.</p>}
      </div>}
    </div>
    <CommonUseCases family={family} />
    <div className="mt-auto">
      <ValueInspector value={value} />
      <div className="mt-4 flex items-center justify-between gap-2"><span className="text-xs text-stone-400">{family.primitive}</span><button type="button" className={`code-toggle ${showCode ? 'text-emerald-800' : ''}`} onClick={() => setShowCode(!showCode)} aria-expanded={showCode}><Code2 size={14} />{showCode ? 'Hide React' : 'React example'}</button></div>
      {showCode && <pre className="code-block"><code>{isListSelect && searchable ? sourceExamples['popover-search'] : sourceExamples[family.id]}</code></pre>}
    </div>
  </article>;
}

function Explorer() {
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const matches = exampleFamilies.filter(family => {
    const matchesFilter = filter === 'all'
      || family.count === filter
      || (family.count === 'both' && (filter === 'single' || filter === 'multiple'))
      || (filter === 'custom' && family.custom)
      || (filter === 'actions' && family.count === 'none');
    return matchesFilter && `${family.name} ${family.summary} ${family.use} ${family.useCases.join(' ')}`.toLowerCase().includes(query.toLowerCase());
  });
  return <>
    <div className="section-heading"><div><h2>Find the right interaction.</h2><p>Real controls, not screenshots. Try them. Inspect what they hold.</p></div><span className="eyebrow">{matches.length} patterns</span></div>
    <div className="filter-bar">
      <div className="segmented" aria-label="Filter examples">{[['all', 'All patterns'], ['actions', 'Actions'], ['single', 'Single'], ['multiple', 'Multiple'], ['custom', 'Custom values']].map(([key, label]) => <button key={key} type="button" aria-pressed={filter === key} className={filter === key ? 'active' : ''} onClick={() => setFilter(key)}>{label}</button>)}</div>
      <label className="search-field"><Search size={15} /><input aria-label="Search patterns" placeholder="Find a pattern..." value={query} onChange={event => setQuery(event.target.value)} /></label>
    </div>
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">{exampleFamilies.map(family => family.id === 'menu'
      ? <ActionMenuCard key={family.id} family={family} hidden={!matches.some(match => match.id === family.id)} />
      : <DemoCard key={family.id} family={family} hidden={!matches.some(match => match.id === family.id)} />)}</div>
    {!matches.length && <div className="empty-state"><Search size={24} /><h3>No matching patterns</h3><p>Try a different search or filter.</p><button className="button-secondary" onClick={() => { setFilter('all'); setQuery(''); }}>Reset filters</button></div>}
    <div className="note scope-note mt-6"><SlidersHorizontal size={20} /><p><strong>This guide helps you choose a component, but it doesn't cover every setup detail.</strong> You still need to decide how options are grouped and whether they're all available right away or load asynchronously; how many choices are allowed; whether users can reorder them; and how validation, disabled options, and applying changes should work.</p></div>
  </>;
}

function downloadText(name, content, type) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function DecisionTree() {
  const container = useRef(null);
  const fitting = useRef(true);
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [size, setSize] = useState(null);
  const renderId = useId().replace(/:/g, '');
  const outlineId = useId();
  const fitDiagram = useCallback((diagramSize) => {
    const viewport = container.current?.parentElement;
    if (!viewport || !diagramSize) return;
    const style = window.getComputedStyle(viewport);
    const availableWidth = viewport.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
    const availableHeight = parseFloat(style.maxHeight) - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom);
    if (availableWidth > 0 && availableHeight > 0) {
      setZoom(Math.min(availableWidth / diagramSize.width, availableHeight / diagramSize.height));
    }
  }, []);
  useEffect(() => {
    let active = true;
    async function render() {
      try {
        const { default: mermaid } = await import('mermaid');
        await document.fonts.ready;
        const theme = getComputedStyle(document.documentElement);
        mermaid.initialize({ startOnLoad: false, securityLevel: 'strict', theme: 'base', themeVariables: { fontFamily: theme.getPropertyValue('--font-sans').trim(), fontSize: '14px', lineColor: theme.getPropertyValue('--color-muted').trim(), edgeLabelBackground: theme.getPropertyValue('--color-surface').trim() }, flowchart: { curve: 'basis', htmlLabels: false, nodeSpacing: 28, rankSpacing: 45, padding: 18 } });
        const { svg } = await mermaid.render(`decision-${renderId}`, decisionTree);
        if (active && container.current) {
          container.current.innerHTML = svg;
          const { width, height } = container.current.querySelector('svg').viewBox.baseVal;
          const diagramSize = { width, height };
          setSize(diagramSize);
          fitDiagram(diagramSize);
          setReady(true);
        }
      } catch (error) { if (active) setError(`The diagram could not render: ${error.message}`); }
    }
    render();
    return () => { active = false; };
  }, [renderId, fitDiagram]);
  useEffect(() => {
    if (!size || !container.current) return;
    const refit = () => { if (fitting.current) fitDiagram(size); };
    const observer = new ResizeObserver(refit);
    observer.observe(container.current.parentElement);
    window.addEventListener('resize', refit);
    return () => { observer.disconnect(); window.removeEventListener('resize', refit); };
  }, [size, fitDiagram]);
  return <div className="diagram-panel">
      <div className="diagram-toolbar"><span className="flex items-center gap-2 text-xs text-stone-500"><GitBranch size={15} />Interaction family / v0.1</span><div className="flex items-center gap-2">
        <button type="button" className="text-xs text-stone-500" aria-label="Fit entire diagram" disabled={!ready} onClick={() => { fitting.current = true; fitDiagram(size); }}>Fit</button>
        <button type="button" className="icon-button" aria-label="Zoom out" disabled={!ready || zoom <= 0.2} onClick={() => { fitting.current = false; setZoom(Math.max(0.2, +(zoom - 0.2).toFixed(1))); }}><Minus size={16} /></button>
        <button type="button" className="text-xs text-stone-500" aria-label="Reset diagram zoom" disabled={!ready} onClick={() => { fitting.current = false; setZoom(1); }}>{ready ? `${Math.round(zoom * 100)}%` : '—'}</button>
        <button type="button" className="icon-button" aria-label="Zoom in" disabled={!ready || zoom >= 2.4} onClick={() => { fitting.current = false; setZoom(Math.min(2.4, +(zoom + 0.2).toFixed(1))); }}><Plus size={16} /></button>
        <button type="button" className="button-secondary !py-1.5" onClick={() => downloadText('form-control-decision-tree.mmd', decisionTree, 'text/plain')}><Download size={14} />Source</button>
      </div></div>
      {error && <p role="alert" className="p-5 text-red-700">{error} The Mermaid source is still available to download.</p>}
      {!ready && !error && <p className="p-8 text-sm text-stone-500" role="status">Rendering the decision tree...</p>}
      <div className="diagram-scroll" tabIndex={0} role="region" aria-label="Scrollable decision tree. Use arrow keys to pan, or Fit to see the entire diagram."><div className="diagram-inner" style={{ width: size ? `${size.width * zoom}px` : '100%' }} ref={container} role="img" aria-label="Decision tree for action menus and value-holding form controls" aria-describedby={outlineId} /></div>
      <div id={outlineId} className="sr-only">
        <ul><li>An action menu / MenuButton invokes commands, not form values. File opens {fileActions.join(', ')}.</li><li>For free-form text, use a text field for one value or a tags input for multiple values. A text field may offer autocomplete completions; accepting one still commits editable text.</li><li>For option selection where people may create a new option, use a creatable combobox for one or multiple values.</li><li>For existing options, consider keeping them all visible, especially for a short list: radio group for one value or checkbox group for multiple values.</li><li>For on-demand selection, consider how people prefer to find options.</li><li>When people know what they want and prefer to type directly, consider a combobox for one or multiple values. Search is in the value field.</li><li>When people prefer to browse and filter if helpful, consider a select or multi-select. A button shows the value or summary, with optional search inside the popover.</li></ul>
      </div>
    </div>
}

const modifiers = [
  ['Value presentation', 'Label, pills, count, summary, or a separate list. Plan wrapping and overflow.'],
  ['Search and suggestions', 'None, text completions in a text field, options in the value-field combobox, or a separate search field in a popover. These behaviors do not determine the family.'],
  ['Option source', 'Local or remote; complete or incremental. Loading strategy is not a family.'],
  ['Option richness', 'Labels, descriptions, avatars, groups, or a hierarchical selection model.'],
  ['Custom commitment', 'Enter, delimiters, paste, or explicit Create. Define validation and duplicates.'],
  ['Creation meaning', 'A form-local object versus a persisted, reusable entity.'],
  ['Selection rules', 'Required, clearable, minimum / maximum counts, and select all.'],
  ['Ordering', 'An unordered set or a meaningful sequence with accessible reordering.'],
  ['Commitment', 'Immediate field updates versus provisional selection with Apply / Cancel.'],
];

function Taxonomy({ onNavigate }) {
  return <>
    <div className="section-heading"><div><h2>A shared language for the team.</h2><p>Working definitions, independent of any library's component names.</p></div><Badge>{families.length} families & compositions</Badge></div>
    <div className="taxonomy-panel overflow-x-auto">
      <table className="taxonomy-table"><caption className="sr-only">Component families, cardinality, search, and intended use</caption><thead><tr><th>Family</th><th>Values</th><th>Search</th><th>Reach for it when...</th></tr></thead>
        <tbody>{families.map(family => <tr key={family.id}><th scope="row">{exampleFamilies.some(example => example.id === family.id) ? <button onClick={() => onNavigate('examples', family.id)} className="flex items-center gap-2 text-left hover:text-emerald-700">{family.name}<ArrowUpRight size={13} /></button> : family.name}{family.custom && <span className="mt-1 block text-xs font-normal text-orange-700">Custom values allowed</span>}</th><td>{family.count === 'both' ? 'One or many' : family.count === 'single' ? 'One' : 'Many'}</td><td>{family.search}</td><td>{family.use}</td></tr>)}</tbody>
      </table>
    </div>
    <div className="note mt-5"><BookOpen size={18} /><p><strong>Search and terminology.</strong> A select keeps the value on its button; a separate search input in its popover only filters the options. Here, a combobox lets people type in the value field to select an existing option; some libraries use the term more broadly. Autocomplete may suggest text completions or filter another control's collection. Accepting a text completion keeps editable text; filtering a collection does not change what the control commits. Autocomplete is a behavior, not a separate selection family. A popover is an anchored floating container, not an interaction family. “Dropdown” is ambiguous: say select or combobox for values, and menu for actions.</p></div>
    <div className="section-heading mt-10"><div><h2>Same family. Different configuration.</h2><p>Use these dimensions to finish the design specification.</p></div><SlidersHorizontal size={20} className="text-stone-400" /></div>
    <div className="grid gap-4 md:grid-cols-3">{modifiers.map(([title, text], index) => <div className="small-panel" key={title}><span className="eyebrow">{String(index + 1).padStart(2, '0')}</span><h3 className="mt-3 text-sm font-semibold">{title}</h3><p className="mt-2 text-sm leading-relaxed text-stone-500">{text}</p></div>)}</div>
    <div className="note mt-5"><BookOpen size={18} /><p><strong>Baseline, not optional modifiers:</strong> keyboard and screen-reader access, mobile behavior, focus management, validation, loading, empty, and error states. Hierarchical selection and remote-data demos are not implemented in this first draft.</p></div>
    <h3 className="mb-3 mt-8 font-semibold">React implementation references</h3><div className="flex flex-wrap gap-2">{families.filter((family, index, all) => all.findIndex(item => item.docs === family.docs) === index).map(family => <a className="reference-link" key={family.id} href={family.docs} target="_blank" rel="noreferrer">{family.primitive}<ArrowUpRight size={13} /></a>)}</div>
  </>;
}

function App() {
  const [page, setPage] = useState('examples');
  function navigate(next, example) {
    setPage(next);
    if (example) requestAnimationFrame(() => document.getElementById(`example-${example}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }));
    else window.scrollTo({ top: 0, behavior: 'instant' });
  }
  return <div className="app-shell">
      <main id="main-content">
        <section className="page-title"><h1>Components exploration</h1></section>
        <nav className="content-tabs" aria-label="Guide sections">{navigation.map(({ id, label, icon: Icon }) => <button type="button" key={id} onClick={() => navigate(id)} className={page === id ? 'active' : ''} aria-current={page === id ? 'page' : undefined}><Icon size={15} />{label === 'Component explorer' ? 'Explore patterns' : label}</button>)}</nav>
        <section className="page-content" aria-label={navigation.find(item => item.id === page).label}>
          {page === 'examples' && <Explorer />}
          {page === 'tree' && <DecisionTree />}
          {page === 'taxonomy' && <Taxonomy onNavigate={navigate} />}
        </section>
        {page !== 'tree' && <footer><span>fieldguide. <span className="text-stone-400">A living reference, not a rigid rulebook.</span></span><span>Choose behavior. Then presentation.</span></footer>}
      </main>
  </div>;
}

createRoot(document.getElementById('root')).render(<App />);
