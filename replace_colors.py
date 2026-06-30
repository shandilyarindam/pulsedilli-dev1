import os
import glob

replacements = [
    ("bg-white", "bg-[var(--surface)]"),
    ("border-slate-200", "border-[var(--border-color)]"),
    ("border-slate-100", "border-[var(--border-subtle)]"),
    ("text-[#1B3A5C]", "text-[var(--brand)]"),
    ("bg-[#1B3A5C]", "bg-[var(--brand)]"),
    ("bg-[#1B3A5C]/5", "bg-[var(--brand)]/10"),
    ("text-slate-500", "text-[var(--text-secondary)]"),
    ("text-slate-400", "text-[var(--text-muted)]"),
    ("text-slate-600", "text-[var(--text-secondary)]"),
    ("text-slate-700", "text-[var(--text-primary)]"),
    ("text-slate-800", "text-[var(--text-primary)]"),
    ("bg-slate-100", "bg-[var(--stat-bg)]"),
    ("bg-slate-50", "bg-[var(--surface-elevated)]"),
    ("bg-slate-200", "bg-[var(--skeleton)]"),
    ("hover:bg-slate-50/50", "hover:bg-[var(--hover-row)]"),
    ("hover:bg-slate-50/80", "hover:bg-[var(--hover-row)]"),
    ("hover:bg-slate-100", "hover:bg-[var(--surface-elevated)]"),
    ("hover:text-slate-900", "hover:text-[var(--text-primary)]"),
    ("hover:text-slate-600", "hover:text-[var(--text-primary)]"),
    ("text-white", "text-[var(--btn-primary-fg)]"),
    ("bg-slate-50/50", "bg-[var(--surface-elevated)]"),
    ("hover:bg-[#15304d]", "hover:bg-[var(--brand-hover)]"),
    ("hover:bg-[#152d48]", "hover:bg-[var(--brand-hover)]"),
    ("Delhi PS-CRM", "Jan Samadhan"),
]

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    orig = content
    for old, new in replacements:
        content = content.replace(old, new)
        
    if orig != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filepath}")

files = glob.glob('app/**/*.tsx', recursive=True) + glob.glob('components/**/*.tsx', recursive=True)
for f in files:
    process_file(f)

