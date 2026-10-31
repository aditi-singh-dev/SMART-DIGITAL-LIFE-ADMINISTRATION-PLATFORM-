import React, { useState } from 'react';
import { 
  ShieldAlert, 
  HeartPulse, 
  PhoneCall, 
  Copy, 
  Check, 
  Download, 
  Printer, 
  User, 
  Hospital, 
  FileText, 
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import Modal from './Modal';
import { useToast } from '../../context/ToastContext';

export default function EmergencyKitModal({ isOpen, onClose }) {
  const { success } = useToast();
  const [copiedSection, setCopiedSection] = useState(null);

  const emergencyData = {
    familyName: 'Singh Family',
    address: 'B-402, Palm Grove Heights, Sector 62, Noida, UP - 201301',
    insurance: {
      provider: 'Star Health Comprehensive Family Floater',
      policyNumber: 'P/161118/01/2026/004521',
      sumInsured: '₹15,00,000 (Cashless TPA)',
      tpaHelpdesk: '1800 425 2255 / 044 2828 8800',
      networkHospitalNearby: 'Fortis Hospital Noida (Sector 62) & Max Super Speciality Vaishali'
    },
    doctor: {
      name: 'Dr. Arvind Mehta (MD, Internal Medicine)',
      clinic: 'Apollo Clinic / Max Healthcare',
      phone: '+91 98765 43210'
    },
    members: [
      {
        name: 'Aditi Singh',
        role: 'Mother / Family Admin',
        bloodGroup: 'B+',
        age: 38,
        aadhaarMasked: 'XXXX-XXXX-4921',
        pan: 'ABCPS1234F',
        phone: '+91 98101 23456',
        allergies: 'Penicillin allergy'
      },
      {
        name: 'Rajesh Singh',
        role: 'Father',
        bloodGroup: 'O+',
        age: 42,
        aadhaarMasked: 'XXXX-XXXX-8832',
        pan: 'BLKPS9921D',
        phone: '+91 98112 34567',
        allergies: 'None'
      },
      {
        name: 'Priya Singh',
        role: 'Daughter / Student',
        bloodGroup: 'B+',
        age: 17,
        aadhaarMasked: 'XXXX-XXXX-1190',
        pan: 'Pending (Minor)',
        phone: '+91 98700 11223',
        allergies: 'Dust & pollen asthma (inhaler in bag)'
      },
      {
        name: 'Sunita Singh',
        role: 'Grandmother (Senior Citizen)',
        bloodGroup: 'AB+',
        age: 68,
        aadhaarMasked: 'XXXX-XXXX-3345',
        pan: 'AYYPS4401M',
        phone: '+91 98100 55667',
        allergies: 'Hypertension (Amlodipine 5mg daily)'
      }
    ]
  };

  const copyWhatsAppFormat = () => {
    const text = `🚨 *GHARSAHAYAK EMERGENCY MEDICAL & INSURANCE KIT* 🚨
*Family:* ${emergencyData.familyName}
*Address:* ${emergencyData.address}

🏥 *HEALTH INSURANCE:*
• Provider: ${emergencyData.insurance.provider}
• Policy No: *${emergencyData.insurance.policyNumber}*
• Sum Insured: ${emergencyData.insurance.sumInsured}
• TPA Toll-Free: ${emergencyData.insurance.tpaHelpdesk}
• Nearby Network: ${emergencyData.insurance.networkHospitalNearby}

👨‍⚕️ *FAMILY DOCTOR:*
• ${emergencyData.doctor.name} - ${emergencyData.doctor.phone}

👥 *MEMBERS & BLOOD GROUPS:*
${emergencyData.members.map(m => `• *${m.name}* (${m.role}): Blood: *${m.bloodGroup}* | Age: ${m.age} | Ph: ${m.phone} | Notes: ${m.allergies}`).join('\n')}

_Shared via GharSahayak Family Life Administration_`;

    navigator.clipboard.writeText(text);
    setCopiedSection('whatsapp');
    success('Emergency details copied to clipboard! Ready to paste into WhatsApp.');
    setTimeout(() => setCopiedSection(null), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" title="Family Emergency Medical & ID Kit">
      <div className="space-y-6">
        {/* Banner */}
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm animate-pulse">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-rose-900 dark:text-rose-100 flex items-center gap-2">
                <span>Immediate Critical Family Access</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-200 dark:bg-rose-900 text-rose-800 dark:text-rose-200 font-extrabold uppercase">SOS Kit</span>
              </h4>
              <p className="text-xs text-rose-700 dark:text-rose-300 mt-0.5">
                Instant access to vital blood groups, Mediclaim policy cards, and emergency numbers for hospital desk or police check.
              </p>
            </div>
          </div>
          <button
            onClick={copyWhatsAppFormat}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex-shrink-0 active:scale-95"
          >
            {copiedSection === 'whatsapp' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copiedSection === 'whatsapp' ? 'Copied for WhatsApp!' : 'Copy for WhatsApp'}</span>
          </button>
        </div>

        {/* Insurance & Doctor Cards Strip */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Mediclaim Card */}
          <div className="p-4 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-900/60">
            <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-200 font-bold text-xs mb-2">
              <Hospital className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Cashless Mediclaim Policy</span>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Insurer:</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">{emergencyData.insurance.provider}</span>
              </div>
              <div className="flex justify-between items-center bg-white dark:bg-slate-900 px-2.5 py-1.5 rounded-lg border border-indigo-100 dark:border-indigo-900">
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">Policy Number:</span>
                <span className="font-mono font-bold text-indigo-700 dark:text-indigo-300">{emergencyData.insurance.policyNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Cover:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">{emergencyData.insurance.sumInsured}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">TPA Helpline:</span>
                <a href="tel:18004252255" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">{emergencyData.insurance.tpaHelpdesk}</a>
              </div>
            </div>
          </div>

          {/* Family Doctor & Contact */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
            <div className="flex items-center gap-2 text-slate-900 dark:text-slate-200 font-bold text-xs mb-2">
              <HeartPulse className="w-4 h-4 text-rose-500" />
              <span>Primary Family Physician</span>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="font-bold text-slate-900 dark:text-slate-100">{emergencyData.doctor.name}</div>
              <p className="text-slate-500 dark:text-slate-400 text-[11px]">{emergencyData.doctor.clinic}</p>
              <div className="pt-2 flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Emergency Call:</span>
                <a 
                  href={`tel:${emergencyData.doctor.phone}`}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 rounded-lg font-bold hover:bg-emerald-200 transition-colors"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>{emergencyData.doctor.phone}</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Member Medical Profiles */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
            Family Members Medical & Identity Ledger
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {emergencyData.members.map((member, idx) => (
              <div 
                key={idx}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs hover:border-indigo-300 dark:hover:border-indigo-700 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h5 className="font-bold text-sm text-slate-900 dark:text-slate-100">{member.name}</h5>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{member.role} · Age {member.age}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 font-extrabold text-xs border border-rose-200 dark:border-rose-900/60 shadow-2xs">
                    {member.bloodGroup}
                  </span>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400 text-[11px]">Aadhaar (Govt ID):</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300">{member.aadhaarMasked}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 text-[11px]">PAN Card:</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300">{member.pan}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-[11px]">Phone:</span>
                    <a href={`tel:${member.phone}`} className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline">{member.phone}</a>
                  </div>
                  {member.allergies !== 'None' && (
                    <div className="mt-1 p-1.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-[10px] font-medium flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 flex-shrink-0 text-amber-600" />
                      <span className="truncate">{member.allergies}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            Encrypted storage · Printable physical medical wallet card
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Emergency Slip</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-900 dark:bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 dark:hover:bg-indigo-500 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
