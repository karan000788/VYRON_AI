'use client';

import React, { useState, useRef } from 'react';
import { FeatureGateShield } from '@/components/ui/feature-gate-shield';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  FileText, Upload, Download, Trash2, Search, Eye,
  FolderOpen, File, FileCheck, FileClock, Plus, Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type DocType = 'contract' | 'report' | 'invoice' | 'proposal' | 'other';

interface Document {
  id: string;
  name: string;
  type: DocType;
  size: string;
  uploadedAt: string;
  status: 'ready' | 'processing' | 'signed';
}

const TYPE_META: Record<DocType, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  contract:  { label: 'Contract',  icon: <FileCheck className="h-4 w-4" />, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  report:    { label: 'Report',    icon: <FileText className="h-4 w-4" />,  color: 'text-cyan-400',    bg: 'bg-cyan-500/10 border-cyan-500/20' },
  invoice:   { label: 'Invoice',   icon: <File className="h-4 w-4" />,      color: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/20' },
  proposal:  { label: 'Proposal',  icon: <Sparkles className="h-4 w-4" />, color: 'text-violet-400',  bg: 'bg-violet-500/10 border-violet-500/20' },
  other:     { label: 'Other',     icon: <FolderOpen className="h-4 w-4" />,color: 'text-zinc-400',    bg: 'bg-zinc-700/30 border-zinc-600/30' },
};

const MOCK_DOCS: Document[] = [
  { id: 'd1', name: 'VYRON AI — SaaS Master Service Agreement.pdf', type: 'contract', size: '348 KB', uploadedAt: 'May 15, 2026', status: 'signed' },
  { id: 'd2', name: 'Q1 Business Growth Report — Karan Gaming.pdf', type: 'report',   size: '1.2 MB', uploadedAt: 'May 10, 2026', status: 'ready' },
  { id: 'd3', name: 'Invoice VYR-2026-00014.pdf',                   type: 'invoice',  size: '92 KB',  uploadedAt: 'May 12, 2026', status: 'ready' },
  { id: 'd4', name: 'AI Automation Proposal — TechEdge Pvt Ltd.pdf',type: 'proposal', size: '560 KB', uploadedAt: 'May 08, 2026', status: 'ready' },
  { id: 'd5', name: 'NDA — Client Confidentiality Agreement.pdf',   type: 'contract', size: '210 KB', uploadedAt: 'May 01, 2026', status: 'signed' },
];

const STATUS_STYLE: Record<Document['status'], string> = {
  ready:      'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  processing: 'bg-amber-500/10  text-amber-400  border-amber-500/20',
  signed:     'bg-cyan-500/10   text-cyan-400   border-cyan-500/20',
};

export default function DocumentsPage() {
  const [docs, setDocs] = useState<Document[]>(MOCK_DOCS);
  const [search, setSearch] = useState('');
  const [activeType, setActiveType] = useState<'all' | DocType>('all');
  const [showUpload, setShowUpload] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Upload form
  const [uploadName, setUploadName] = useState('');
  const [uploadType, setUploadType] = useState<DocType>('other');
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  const filtered = docs.filter(d => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase());
    const matchType = activeType === 'all' || d.type === activeType;
    return matchSearch && matchType;
  });

  const handleFileSelect = (file: File) => {
    setUploadFile(file);
    if (!uploadName) setUploadName(file.name.replace(/\.[^.]+$/, ''));
    toast.success(`File "${file.name}" selected.`);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadName.trim()) { toast.error('Enter a document name.'); return; }
    const newDoc: Document = {
      id: crypto.randomUUID(),
      name: uploadName.trim() + (uploadFile ? `.${uploadFile.name.split('.').pop()}` : '.pdf'),
      type: uploadType,
      size: uploadFile ? `${(uploadFile.size / 1024).toFixed(0)} KB` : '—',
      uploadedAt: new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'processing',
    };
    setDocs([newDoc, ...docs]);

    // Simulate processing → ready
    setTimeout(() => {
      setDocs(prev => prev.map(d => d.id === newDoc.id ? { ...d, status: 'ready' } : d));
    }, 2000);

    setShowUpload(false);
    setUploadName(''); setUploadFile(null); setUploadType('other');
    toast.success('Document uploaded and indexed successfully!');
  };

  const handleDownload = (name: string) => toast.success(`"${name}" downloaded successfully.`);
  const handlePreview  = (name: string) => toast.success(`Previewing "${name}" in document viewer.`);
  const handleDelete   = (id: string, name: string) => {
    setDocs(docs.filter(d => d.id !== id));
    toast.success(`"${name}" removed from workspace.`);
  };

  const totalSize = docs.length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
            Document Center
          </h1>
          <p className="text-xs text-zinc-500">
            Store, manage, and download contracts, reports, invoices, and business documents per workspace.
          </p>
        </div>
        <Button
          onClick={() => setShowUpload(true)}
          className="bg-white text-black hover:bg-zinc-200 rounded-xl text-xs px-4 h-9 gap-1.5 font-bold self-start sm:self-auto"
        >
          <Upload className="h-4 w-4" />
          Upload Document
        </Button>
      </div>

      <FeatureGateShield feature="gst_automation" requiredPlan="Starter">

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Documents', value: totalSize, icon: <FileText className="h-4 w-4 text-cyan-400" />, color: 'text-white' },
            { label: 'Contracts',  value: docs.filter(d => d.type === 'contract').length,  icon: <FileCheck className="h-4 w-4 text-emerald-400" />, color: 'text-emerald-400' },
            { label: 'Reports',    value: docs.filter(d => d.type === 'report').length,    icon: <FileClock className="h-4 w-4 text-amber-400" />,   color: 'text-amber-400' },
            { label: 'Proposals',  value: docs.filter(d => d.type === 'proposal').length,  icon: <Sparkles className="h-4 w-4 text-violet-400" />,    color: 'text-violet-400' },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="rounded-xl border border-white/10 bg-zinc-950/40 backdrop-blur-xl p-4 space-y-2"
            >
              <div className="flex items-center gap-2 text-xs text-zinc-400">{s.icon}{s.label}</div>
              <p className={`text-2xl font-bold font-mono ${s.color}`}>{s.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Upload Modal */}
        <AnimatePresence>
          {showUpload && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.95, y: 16 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95 }}
                className="w-full max-w-lg rounded-2xl border border-white/10 bg-zinc-950 p-6 space-y-5"
              >
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <Upload className="h-4 w-4 text-cyan-400" />
                    Upload Document
                  </h3>
                  <button onClick={() => setShowUpload(false)} className="text-zinc-500 hover:text-white text-xs">Cancel</button>
                </div>

                <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
                  {/* Drop Zone */}
                  <div
                    onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-all ${
                      dragOver
                        ? 'border-cyan-400 bg-cyan-400/5 text-cyan-400'
                        : uploadFile
                          ? 'border-emerald-400/40 bg-emerald-400/5 text-emerald-400'
                          : 'border-white/10 text-zinc-500 hover:border-white/20 hover:bg-white/5'
                    }`}
                  >
                    <Upload className="h-7 w-7 mx-auto mb-2 opacity-60" />
                    {uploadFile
                      ? <p className="font-semibold">{uploadFile.name} — {(uploadFile.size / 1024).toFixed(0)} KB</p>
                      : <><p className="font-semibold">Drop file here or click to browse</p><p className="mt-1 text-[10px]">PDF, DOCX, XLSX supported</p></>
                    }
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      accept=".pdf,.doc,.docx,.xlsx,.csv"
                      onChange={e => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                    />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1">
                      <label className="text-zinc-400">Document Name</label>
                      <Input value={uploadName} onChange={e => setUploadName(e.target.value)} placeholder="e.g. Q2 Financial Report" className="bg-zinc-900 border-white/10 h-9 text-xs" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-zinc-400">Document Type</label>
                      <select value={uploadType} onChange={e => setUploadType(e.target.value as DocType)} className="w-full rounded-lg border border-white/10 bg-zinc-900 px-2.5 h-9 text-xs focus:outline-none text-white">
                        {(Object.keys(TYPE_META) as DocType[]).map(t => (
                          <option key={t} value={t}>{TYPE_META[t].label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <Button type="button" variant="ghost" onClick={() => setShowUpload(false)} className="text-xs h-9 rounded-xl">Cancel</Button>
                    <Button type="submit" className="bg-gradient-to-r from-cyan-500 to-violet-500 text-white font-bold text-xs h-9 rounded-xl px-5">
                      Upload & Index
                    </Button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filters Row */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search documents..."
              className="pl-9 bg-zinc-900 border-white/10 h-9 text-xs"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {(['all', ...Object.keys(TYPE_META)] as const).map(t => (
              <button
                key={t}
                onClick={() => setActiveType(t as any)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition-all ${
                  activeType === t
                    ? 'bg-white text-black'
                    : 'bg-white/5 text-zinc-400 hover:text-white border border-white/10'
                }`}
              >
                {t === 'all' ? 'All' : TYPE_META[t as DocType].label}
              </button>
            ))}
          </div>
        </div>

        {/* Documents List */}
        <Card className="border border-white/10 bg-zinc-950/40 backdrop-blur-xl overflow-hidden">
          {filtered.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center gap-3 text-zinc-500">
              <FolderOpen className="h-10 w-10 text-zinc-700" />
              <p className="text-sm font-semibold text-zinc-400">No documents found</p>
              <p className="text-xs max-w-xs">
                {search ? 'Try a different search term.' : 'Upload contracts, reports, and other files to get started.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-white/5 text-zinc-400 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="p-4">Document</th>
                    <th className="p-4">Type</th>
                    <th className="p-4 hidden sm:table-cell">Size</th>
                    <th className="p-4 hidden md:table-cell">Uploaded</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <AnimatePresence>
                    {filtered.map((doc, i) => {
                      const meta = TYPE_META[doc.type];
                      return (
                        <motion.tr
                          key={doc.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ delay: i * 0.04 }}
                          className="hover:bg-white/5 transition-colors"
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className={`h-8 w-8 rounded-lg border flex items-center justify-center flex-shrink-0 ${meta.bg} ${meta.color}`}>
                                {meta.icon}
                              </div>
                              <span className="font-medium text-white max-w-[200px] truncate" title={doc.name}>{doc.name}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${meta.bg} ${meta.color}`}>
                              {meta.label}
                            </span>
                          </td>
                          <td className="p-4 text-zinc-500 hidden sm:table-cell font-mono">{doc.size}</td>
                          <td className="p-4 text-zinc-500 hidden md:table-cell">{doc.uploadedAt}</td>
                          <td className="p-4">
                            <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold capitalize ${STATUS_STYLE[doc.status]}`}>
                              {doc.status}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handlePreview(doc.name)}
                                className="h-7 w-7 inline-flex items-center justify-center rounded-lg border border-white/5 bg-zinc-900 text-zinc-400 hover:text-white transition-colors"
                                title="Preview"
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => handleDownload(doc.name)}
                                className="h-7 w-7 inline-flex items-center justify-center rounded-lg border border-white/5 bg-zinc-900 text-zinc-400 hover:text-cyan-400 transition-colors"
                                title="Download"
                              >
                                <Download className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => handleDelete(doc.id, doc.name)}
                                className="h-7 w-7 inline-flex items-center justify-center rounded-lg border border-red-500/10 bg-red-500/5 text-red-500/60 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </FeatureGateShield>
    </div>
  );
}
