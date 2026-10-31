import React, { useState } from 'react';
import { 
  FileDown, 
  Printer, 
  Check, 
  FileSpreadsheet, 
  FileText, 
  ShieldCheck, 
  Calendar,
  User,
  Filter
} from 'lucide-react';
import Modal from '../common/Modal';
import { useToast } from '../../context/ToastContext';

export default function VaultExportModal({ isOpen, onClose, documents = [] }) {
  const { success } = useToast();
  const [format, setFormat] = useState('csv');
  const [downloading, setDownloading] = useState(false);

  const handleDownloadCSV = () => {
    setDownloading(true);
    try {
      const headers = ['Document Title', 'Owner', 'Category', 'Status', 'Expiry Date', 'File Name', 'Physical Locker Location'];
      const rows = documents.map(d => [
        `"${d.title || ''}"`,
        `"${d.owner_name || ''}"`,
        `"${d.category || ''}"`,
        `"${d.status || 'valid'}"`,
        `"${d.expiry_date || 'N/A'}"`,
        `"${d.file_name || ''}"`,
        `"${d.locker_location || 'Master Bedroom Locker / Folder A'}"`
      ]);

      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `GharSahayak_SinghFamily_Vault_Manifest_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      success('Vault manifest exported successfully (CSV)!');
      setTimeout(() => onClose(), 1000);
    } catch (e) {
      console.error(e);
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" title="Export Family Document Manifest">
      <div className="space-y-6">
        <div className="p-4 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-900/60 flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-indigo-900 dark:text-indigo-200">
              Executive Family Audit Manifest ({documents.length} Records)
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
              Export an official physical index of your family's identity certificates, vehicle policies, insurance records, and property deeds for backup or banking audit.
            </p>
          </div>
        </div>

        {/* Options */}
        <div className="grid grid-cols-2 gap-3">
          <div
            onClick={() => setFormat('csv')}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              format === 'csv'
                ? 'bg-indigo-50/60 dark:bg-indigo-950/50 border-indigo-500 ring-2 ring-indigo-500/20'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <FileSpreadsheet className={`w-5 h-5 ${format === 'csv' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
              {format === 'csv' && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
            </div>
            <h5 className="font-bold text-xs text-slate-900 dark:text-slate-100">Spreadsheet (CSV / Excel)</h5>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Structured spreadsheet with all metadata and locker notes.</p>
          </div>

          <div
            onClick={() => setFormat('print')}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              format === 'print'
                ? 'bg-indigo-50/60 dark:bg-indigo-950/50 border-indigo-500 ring-2 ring-indigo-500/20'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <Printer className={`w-5 h-5 ${format === 'print' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
              {format === 'print' && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
            </div>
            <h5 className="font-bold text-xs text-slate-900 dark:text-slate-100">Printable PDF / Paper Manifest</h5>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Formatted layout ready for physical home folder or bank safe.</p>
          </div>
        </div>

        {/* Preview Summary */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden text-xs">
          <div className="px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300 flex justify-between">
            <span>Manifest Preview (First 4 of {documents.length} items)</span>
            <span className="text-[11px] font-normal text-slate-500">All members included</span>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80 bg-white dark:bg-slate-900 max-h-48 overflow-y-auto">
            {documents.slice(0, 4).map((doc, idx) => (
              <div key={idx} className="p-3 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100">{doc.title}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">{doc.owner_name} · {doc.category}</div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-[11px] text-slate-600 dark:text-slate-300">
                    {doc.expiry_date ? `Exp: ${doc.expiry_date}` : 'Lifetime Valid'}
                  </div>
                  <span className={`text-[10px] uppercase font-bold ${
                    doc.status === 'expired' ? 'text-rose-500' :
                    doc.status === 'expiring_soon' ? 'text-amber-500' : 'text-emerald-500'
                  }`}>
                    {doc.status || 'valid'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          {format === 'csv' ? (
            <button
              type="button"
              onClick={handleDownloadCSV}
              disabled={downloading}
              className="flex items-center gap-1.5 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
            >
              <FileDown className="w-4 h-4" />
              <span>Download CSV File</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Print Manifest Now</span>
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
