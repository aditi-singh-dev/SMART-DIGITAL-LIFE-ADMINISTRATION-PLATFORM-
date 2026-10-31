import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { 
  Files, 
  Search, 
  Plus, 
  LayoutGrid, 
  List, 
  Download, 
  MoreVertical, 
  FileText, 
  Lock, 
  Eye,
  Trash2,
  FileDown
} from 'lucide-react';
import DocumentUploadModal from './DocumentUploadModal';
import DocumentDetailModal from './DocumentDetailModal';
import VaultExportModal from '../../components/vault/VaultExportModal';
import EmptyState from '../../components/common/EmptyState';
import { TableSkeleton } from '../../components/common/Skeleton';

const CATEGORIES = [
  'All',
  'Identity',
  'Education',
  'Vehicle',
  'Insurance',
  'Property',
  'Financial',
  'Employment',
  'Warranty',
  'Government',
  'Other'
];

export default function DocumentVaultPage() {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedOwner, setSelectedOwner] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  
  const [familyMembers, setFamilyMembers] = useState([]);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);

  const fetchDocs = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedCategory !== 'All') params.category = selectedCategory;
      if (selectedOwner !== 'all') params.owner_id = selectedOwner;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await api.getDocuments(params);
      if (res.success) {
        setDocuments(res.documents || []);
      }
    } catch (e) {
      error('Failed to load documents.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function loadMembers() {
      try {
        const res = await api.getFamily();
        if (res.success && res.family?.members) {
          setFamilyMembers(res.family.members);
        }
      } catch (e) {}
    }
    loadMembers();
  }, []);

  useEffect(() => {
    fetchDocs();
    const handleRefresh = () => fetchDocs();
    window.addEventListener('refresh:documents', handleRefresh);
    return () => window.removeEventListener('refresh:documents', handleRefresh);
  }, [selectedCategory, selectedOwner, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Documents</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Keep important family records organized, secured, and accessible.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Export Manifest Button */}
          <button
            type="button"
            onClick={() => setExportModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold shadow-2xs transition-all active:scale-95"
            title="Export or Print Family Document Audit Manifest"
          >
            <FileDown className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="hidden sm:inline">Export Manifest</span>
          </button>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-0.5 shadow-2xs">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-slate-500 dark:text-slate-400 transition-colors ${
                viewMode === 'grid' ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white' : 'hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg text-slate-500 dark:text-slate-400 transition-colors ${
                viewMode === 'list' ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white' : 'hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Upload Button */}
          <button
            onClick={() => setUploadModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#172554] dark:bg-indigo-600 hover:bg-slate-900 dark:hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4 stroke-[2.2]" />
            <span>Upload Document</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents by name, authority, or notes..."
            className="w-full pl-9 pr-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all shadow-2xs"
          />
        </div>

        {/* Member Filter */}
        <div className="flex items-center gap-2">
          <select
            value={selectedOwner}
            onChange={(e) => setSelectedOwner(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 shadow-2xs"
          >
            <option value="all">All Family Members</option>
            {familyMembers.map((m) => (
              <option key={m.user_id} value={m.user_id}>
                {m.full_name} ({m.relationship || m.role})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Category Pills Slider */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCategory === cat
                ? 'bg-[#172554] dark:bg-indigo-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Content Rendering */}
      {loading ? (
        <TableSkeleton rows={4} />
      ) : documents.length === 0 ? (
        <EmptyState
          icon={Files}
          title="No documents yet"
          description="Keep important family records organized in one secure place."
          actionLabel="Upload your first document"
          onAction={() => setUploadModalOpen(true)}
        />
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {documents.map((doc) => {
            return (
              <div
                key={doc.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-card hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-md transition-all p-5 flex flex-col justify-between group relative"
              >
                <div>
                  {/* Top Row: File Type tag & Menu */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                      PDF
                    </span>

                    <div className="flex items-center gap-1">
                      {doc.visibility === 'private' && (
                        <span title="Private document">
                          <Lock className="w-3.5 h-3.5 text-amber-500" />
                        </span>
                      )}
                      <button
                        onClick={() => setSelectedDoc(doc)}
                        className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 rounded hover:bg-slate-50 dark:hover:bg-slate-800"
                        title="Document Details"
                      >
                        <MoreVertical className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Title & Owner */}
                  <h4 
                    onClick={() => setSelectedDoc(doc)}
                    className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors cursor-pointer truncate leading-snug"
                  >
                    {doc.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">{doc.owner_name}</p>

                  {/* Category */}
                  <div className="mt-3">
                    <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 px-2 py-0.5 rounded-md">
                      {doc.category}
                    </span>
                  </div>
                </div>

                {/* Expiry and status info */}
                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                  {doc.expiry_date ? (
                    <div>
                      <p className="text-slate-400 dark:text-slate-500 text-[10px]">Expires {doc.expiry_date}</p>
                      <p className={`font-semibold flex items-center gap-1 mt-0.5 ${
                        doc.status_tag === 'expired' ? 'text-rose-600 dark:text-rose-400' :
                        doc.status_tag === 'urgent' ? 'text-rose-600 dark:text-rose-400' :
                        doc.status_tag === 'approaching' ? 'text-amber-600 dark:text-amber-400' :
                        'text-emerald-600 dark:text-emerald-400'
                      }`}>
                        <span>●</span>
                        <span>
                          {doc.days_remaining < 0 
                            ? 'Expired' 
                            : `${doc.days_remaining} days remaining`}
                        </span>
                      </p>
                    </div>
                  ) : (
                    <span className="text-slate-400 dark:text-slate-500">No expiration date</span>
                  )}

                  <button
                    onClick={() => setSelectedDoc(doc)}
                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                  >
                    Details →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* LIST VIEW */
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-card overflow-hidden">
          <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4 text-left">Document Title</th>
                <th className="py-3.5 px-4 text-left">Category</th>
                <th className="py-3.5 px-4 text-left">Owner</th>
                <th className="py-3.5 px-4 text-left">Expiry Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                    <div className="flex items-center gap-2.5">
                      <FileText className="w-4 h-4 text-slate-400 dark:text-slate-500 flex-shrink-0" />
                      <span 
                        onClick={() => setSelectedDoc(doc)}
                        className="cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 truncate max-w-xs"
                      >
                        {doc.title}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                      {doc.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5">
                      <div 
                        className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[8px] font-bold"
                        style={{ backgroundColor: doc.owner_color || '#4F46E5' }}
                      >
                        {doc.owner_name?.substring(0, 1)}
                      </div>
                      <span>{doc.owner_name}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    {doc.expiry_date ? (
                      <span className={`font-semibold flex items-center gap-1 ${
                        doc.status_tag === 'expired' ? 'text-rose-600 dark:text-rose-400' :
                        doc.status_tag === 'urgent' ? 'text-rose-600 dark:text-rose-400' :
                        doc.status_tag === 'approaching' ? 'text-amber-600 dark:text-amber-400' :
                        'text-emerald-600 dark:text-emerald-400'
                      }`}>
                        <span>●</span>
                        <span>{doc.expiry_date} ({doc.days_remaining}d)</span>
                      </span>
                    ) : (
                      <span className="text-slate-400 dark:text-slate-500">N/A</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-2">
                    <button
                      onClick={() => setSelectedDoc(doc)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded"
                      title="View details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <a
                      href={doc.file_url}
                      target="_blank"
                      rel="noreferrer"
                      download={doc.original_filename}
                      className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded inline-block"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Upload Modal */}
      {uploadModalOpen && (
        <DocumentUploadModal
          isOpen={uploadModalOpen}
          onClose={() => setUploadModalOpen(false)}
          onUploaded={fetchDocs}
        />
      )}

      {/* Detail Modal */}
      {selectedDoc && (
        <DocumentDetailModal
          isOpen={!!selectedDoc}
          onClose={() => setSelectedDoc(null)}
          document={selectedDoc}
          onDeleted={fetchDocs}
          onUpdated={fetchDocs}
        />
      )}

      {/* Export Manifest Modal */}
      {exportModalOpen && (
        <VaultExportModal
          isOpen={exportModalOpen}
          onClose={() => setExportModalOpen(false)}
          documents={documents}
        />
      )}
    </div>
  );
}
