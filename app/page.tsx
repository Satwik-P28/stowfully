'use client';

import { useMemo, useRef, useState, useSyncExternalStore } from 'react';
import Image from 'next/image';
import {
  Archive,
  Download,
  ExternalLink,
  FileUp,
  Grid2X2,
  Image as ImageIcon,
  Link2,
  Plus,
  Search,
  ShieldCheck,
  StickyNote,
  Trash2,
  X,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  findKeepsakes,
  normalizeTags,
  parseVaultExport,
  SAMPLE_KEEPSAKES,
  type Keepsake,
  type KeepsakeKind,
} from '@/lib/vault';

const kindMeta = {
  link: { label: 'Link', icon: Link2, color: 'bg-[#bfd9dc]' },
  note: { label: 'Note', icon: StickyNote, color: 'bg-[#f0c4a7]' },
  image: { label: 'Image', icon: ImageIcon, color: 'bg-[#c9d8b9]' },
};

function loadVault() {
  if (typeof window === 'undefined') return SAMPLE_KEEPSAKES;
  try {
    const raw = localStorage.getItem('stowfully-vault-v1');
    return raw ? parseVaultExport(raw) : SAMPLE_KEEPSAKES;
  } catch {
    return SAMPLE_KEEPSAKES;
  }
}

function saveFile(name: string, value: string) {
  const href = URL.createObjectURL(
    new Blob([value], { type: 'application/json' }),
  );
  const anchor = document.createElement('a');
  anchor.href = href;
  anchor.download = name;
  anchor.click();
  URL.revokeObjectURL(href);
}

export default function Home() {
  const hydrated = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
  const [items, setItems] = useState<Keepsake[]>(loadVault);
  const [query, setQuery] = useState('');
  const [kind, setKind] = useState<KeepsakeKind | 'all'>('all');
  const [composer, setComposer] = useState(false);
  const [draftKind, setDraftKind] = useState<KeepsakeKind>('link');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [url, setUrl] = useState('');
  const [tags, setTags] = useState('');
  const [image, setImage] = useState('');
  const [notice, setNotice] = useState('Saved only in this browser.');
  const importRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLInputElement>(null);
  const visible = useMemo(
    () => findKeepsakes(items, query, kind),
    [items, query, kind],
  );

  function persist(next: Keepsake[]) {
    setItems(next);
    localStorage.setItem('stowfully-vault-v1', JSON.stringify(next));
  }
  function clearDraft() {
    setTitle('');
    setBody('');
    setUrl('');
    setTags('');
    setImage('');
  }
  function addItem() {
    if (!title.trim()) {
      setNotice('Give this keepsake a title first.');
      return;
    }
    const next: Keepsake = {
      id: crypto.randomUUID(),
      kind: draftKind,
      title: title.trim(),
      body: body.trim(),
      tags: normalizeTags(tags),
      createdAt: new Date().toISOString(),
      ...(draftKind === 'link' && url.trim() ? { url: url.trim() } : {}),
      ...(draftKind === 'image' && image ? { image } : {}),
    };
    persist([next, ...items]);
    clearDraft();
    setComposer(false);
    setNotice('Keepsake tucked away locally.');
  }
  async function readImage(file?: File) {
    if (!file || !file.type.startsWith('image/')) return;
    if (file.size > 1_500_000) {
      setNotice('Choose an image under 1.5 MB for this browser-local build.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') setImage(reader.result);
    };
    reader.readAsDataURL(file);
  }
  async function importVault(file?: File) {
    if (!file) return;
    try {
      const incoming = parseVaultExport(await file.text());
      persist(incoming);
      setNotice(`${incoming.length} keepsakes restored.`);
    } catch {
      setNotice('That file is not a valid Stowfully export.');
    }
  }

  if (!hydrated)
    return (
      <main
        className="min-h-screen bg-background"
        aria-label="Loading Stowfully"
      />
    );
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[90rem] items-center gap-3 px-4 sm:px-7">
          <span className="grid size-9 place-items-center rounded-full bg-primary text-primary-foreground">
            <Archive className="size-4" />
          </span>
          <p className="mr-auto text-xl font-semibold tracking-[-.045em]">
            Stowfully
          </p>
          <Badge variant="outline" className="hidden sm:flex">
            <ShieldCheck data-icon="inline-start" /> Private by default
          </Badge>
          <Button onClick={() => setComposer(true)}>
            <Plus data-icon="inline-start" /> Add keepsake
          </Button>
        </div>
      </header>

      <div className="mx-auto grid max-w-[90rem] lg:grid-cols-[15rem_1fr]">
        <aside className="border-b p-4 lg:min-h-[calc(100vh-4rem)] lg:border-b-0 lg:border-r lg:p-6">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[.16em] text-muted-foreground">
            Library
          </p>
          <nav className="flex gap-2 overflow-x-auto lg:flex-col">
            {(['all', 'link', 'note', 'image'] as const).map((value) => {
              const Icon = value === 'all' ? Grid2X2 : kindMeta[value].icon;
              return (
                <Button
                  key={value}
                  variant={kind === value ? 'secondary' : 'ghost'}
                  className="justify-start"
                  onClick={() => setKind(value)}
                >
                  <Icon data-icon="inline-start" />{' '}
                  {value === 'all' ? 'Everything' : kindMeta[value].label}s
                </Button>
              );
            })}
          </nav>
          <div className="mt-8 hidden border-t pt-5 lg:block">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() =>
                saveFile('stowfully-vault.json', JSON.stringify(items, null, 2))
              }
            >
              <Download data-icon="inline-start" /> Export vault
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => importRef.current?.click()}
            >
              <FileUp data-icon="inline-start" /> Restore export
            </Button>
            <Input
              ref={importRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(event) => void importVault(event.target.files?.[0])}
            />
          </div>
        </aside>

        <section className="min-w-0 px-4 py-8 sm:px-8 lg:px-10 lg:py-11">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[.17em] text-primary">
                Visual memory
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-[-.05em] sm:text-5xl">
                Keep what still feels alive.
              </h1>
              <p
                aria-live="polite"
                className="mt-2 text-sm text-muted-foreground"
              >
                {notice}
              </p>
            </div>
            <div className="flex h-11 w-full items-center gap-2 rounded-full border bg-card px-4 sm:w-80">
              <Search className="size-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search your keepsakes"
                aria-label="Search your keepsakes"
                className="h-auto border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
              />
            </div>
          </div>

          {visible.length ? (
            <div className="columns-1 gap-5 sm:columns-2 xl:columns-3 2xl:columns-4">
              {visible.map((item, index) => {
                const meta = kindMeta[item.kind];
                const Icon = meta.icon;
                return (
                  <article
                    key={item.id}
                    className="group mb-5 break-inside-avoid overflow-hidden rounded-[1.6rem] border bg-card shadow-[0_10px_30px_rgba(32,48,40,.06)]"
                  >
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt=""
                        width={640}
                        height={480}
                        unoptimized
                        className="aspect-[4/3] w-full object-cover"
                      />
                    ) : (
                      <div
                        className={`${meta.color} flex min-h-40 items-end p-6`}
                      >
                        <span className="font-serif text-5xl opacity-50">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                      </div>
                    )}
                    <div className="p-5">
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[.13em] text-muted-foreground">
                        <Icon className="size-3.5" /> {meta.label}
                        <Button
                          aria-label={`Delete ${item.title}`}
                          size="icon-sm"
                          variant="ghost"
                          className="ml-auto opacity-60 hover:opacity-100"
                          onClick={() => {
                            persist(
                              items.filter((saved) => saved.id !== item.id),
                            );
                            setNotice('Keepsake removed.');
                          }}
                        >
                          <Trash2 />
                        </Button>
                      </div>
                      <h2 className="mt-2 text-xl font-medium tracking-[-.025em]">
                        {item.title}
                      </h2>
                      {item.body && (
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                          {item.body}
                        </p>
                      )}
                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary"
                        >
                          Visit source <ExternalLink className="size-3.5" />
                        </a>
                      )}
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {item.tags.map((tag) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="grid min-h-72 place-items-center rounded-[2rem] border border-dashed bg-card/50 text-center">
              <div>
                <Search className="mx-auto size-7 text-muted-foreground" />
                <h2 className="mt-3 font-medium">Nothing tucked here yet</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Try a different search or add a keepsake.
                </p>
              </div>
            </div>
          )}
        </section>
      </div>

      {composer && (
        <dialog
          open
          className="fixed inset-0 z-50 grid place-items-center bg-[#203029]/45 p-4 backdrop-blur-sm"
          aria-label="Add a keepsake"
        >
          <section className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-[2rem] bg-card p-5 shadow-2xl sm:p-7">
            <div className="flex items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[.16em] text-primary">
                  New keepsake
                </p>
                <h2 className="mt-1 text-2xl font-semibold tracking-[-.04em]">
                  What are you saving?
                </h2>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="ml-auto"
                onClick={() => setComposer(false)}
              >
                <X />
              </Button>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-2">
              {(['link', 'note', 'image'] as const).map((value) => {
                const Icon = kindMeta[value].icon;
                return (
                  <Button
                    key={value}
                    variant={draftKind === value ? 'default' : 'outline'}
                    onClick={() => setDraftKind(value)}
                  >
                    <Icon data-icon="inline-start" /> {kindMeta[value].label}
                  </Button>
                );
              })}
            </div>
            <div className="mt-5 space-y-4">
              <Input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Title"
                aria-label="Keepsake title"
              />
              {draftKind === 'link' && (
                <Input
                  type="url"
                  value={url}
                  onChange={(event) => setUrl(event.target.value)}
                  placeholder="https://"
                  aria-label="Source URL"
                />
              )}
              {draftKind === 'image' && (
                <>
                  <Input
                    ref={imageRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) =>
                      void readImage(event.target.files?.[0])
                    }
                  />
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => imageRef.current?.click()}
                  >
                    <ImageIcon data-icon="inline-start" />{' '}
                    {image
                      ? 'Image ready — choose another'
                      : 'Choose image under 1.5 MB'}
                  </Button>
                  {image && (
                    <Image
                      src={image}
                      alt="Preview"
                      width={640}
                      height={360}
                      unoptimized
                      className="max-h-48 w-full rounded-2xl object-cover"
                    />
                  )}
                </>
              )}
              <Textarea
                value={body}
                onChange={(event) => setBody(event.target.value)}
                placeholder="A note for your future self…"
                className="min-h-28"
                aria-label="Keepsake note"
              />
              <Input
                value={tags}
                onChange={(event) => setTags(event.target.value)}
                placeholder="design, reading, later"
                aria-label="Comma-separated tags"
              />
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setComposer(false)}>
                Cancel
              </Button>
              <Button onClick={addItem}>Stow it away</Button>
            </div>
          </section>
        </dialog>
      )}
    </main>
  );
}
