import React, { useState, useMemo, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Briefcase, 
  Clock, 
  AlertCircle, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Trash2, 
  Archive, 
  ChevronRight, 
  ExternalLink, 
  Mail, 
  MessageSquare, 
  Phone, 
  Send, 
  X,
  CheckCircle2,
  Calendar as CalendarIcon,
  ArrowUpRight,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format, isAfter, isBefore, startOfDay, isToday, parseISO } from 'date-fns';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useCases } from './hooks/useCases';
import { 
  Case, 
  Role, 
  CaseType,
  Status, 
  Priority, 
  FollowUpMethod, 
  SMD_BASE_SUBCATEGORIES, 
  LIFE_AGENT_SUBCATEGORIES, 
  CASE_MANAGERS, 
  STATUS_COLORS, 
  PRIORITY_COLORS,
  ASSISTANT_EMAIL
} from './types';

// --- Utilities ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Components ---

const Badge = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider", className)}>
    {children}
  </span>
);

const IconButton = ({ icon: Icon, onClick, className, size = 18 }: { icon: any; onClick?: () => void; className?: string; size?: number }) => (
  <button 
    onClick={onClick}
    className={cn("p-1.5 rounded hover:bg-gray-100 text-gray-500 transition-colors", className)}
  >
    <Icon size={size} />
  </button>
);

function NavItem({ icon: Icon, label, active, onClick, badge }: { icon: any; label: string; active: boolean; onClick: () => void; badge?: number }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2 rounded text-sm font-medium transition-all group",
        active ? "bg-[#0066FF] text-white shadow-md shadow-blue-100" : "text-gray-600 hover:bg-gray-50"
      )}
    >
      <Icon size={18} className={cn(active ? "text-white" : "text-gray-400 group-hover:text-gray-600")} />
      <span className="flex-1 text-left">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className={cn(
          "px-1.5 py-0.5 rounded text-[10px] font-bold",
          active ? "bg-white text-[#0066FF]" : "bg-red-500 text-white"
        )}>
          {badge}
        </span>
      )}
    </button>
  );
}

function RoleItem({ icon: Icon, label, count, active, onClick }: { icon: any; label: string; count: number; active: boolean; onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2 rounded text-xs font-bold uppercase tracking-tight transition-all",
        active ? "bg-gray-100 text-[#0066FF]" : "text-gray-500 hover:bg-gray-50"
      )}
    >
      <Icon size={14} className={active ? "text-[#0066FF]" : "text-gray-400"} />
      <span className="flex-1 text-left">{label}</span>
      <span className="text-[10px] font-mono opacity-60">{count}</span>
    </button>
  );
}

function Dashboard({ stats, cases }: { stats: any; cases: Case[] }) {
  const chartData = [
    { name: 'SMD Base', open: stats.karma.open, pending: stats.karma.pending, awaiting: stats.karma.awaiting, urgent: stats.karma.urgent },
    { name: 'Life Agent', open: stats.life.open, pending: stats.life.pending, awaiting: stats.life.awaiting, urgent: stats.life.urgent },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="grid grid-cols-4 gap-6">
        <StatCard label="Active Cases" value={stats.total} icon={Briefcase} color="blue" />
        <StatCard label="Due Today" value={stats.dueToday} icon={Clock} color="amber" />
        <StatCard label="Overdue" value={stats.overdue} icon={AlertCircle} color="red" />
        <StatCard label="Urgent Priority" value={stats.karma.urgent + stats.life.urgent} icon={ArrowUpRight} color="red" />
      </div>

      <div className="grid grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-6">Case Distribution by Role</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }} />
                <Tooltip cursor={{ fill: '#F8F9FA' }} contentStyle={{ borderRadius: '4px', border: '1px solid #E2E8F0', fontSize: '12px' }} />
                <Bar dataKey="pending" fill="#FFB800" radius={[4, 4, 0, 0]} barSize={30} />
                <Bar dataKey="awaiting" fill="#A855F7" radius={[4, 4, 0, 0]} barSize={30} />
                <Bar dataKey="urgent" fill="#EF4444" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-6">Priority Breakdown</h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Low', value: cases.filter(c => c.priority === 'Low').length },
                    { name: 'Medium', value: cases.filter(c => c.priority === 'Medium').length },
                    { name: 'High', value: cases.filter(c => c.priority === 'High').length },
                    { name: 'Urgent', value: cases.filter(c => c.priority === 'Urgent').length },
                  ]}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  <Cell fill="#94A3B8" />
                  <Cell fill="#0066FF" />
                  <Cell fill="#FFB800" />
                  <Cell fill="#EF4444" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2">
              <LegendItem color="bg-gray-400" label="Low" />
              <LegendItem color="bg-[#0066FF]" label="Medium" />
              <LegendItem color="bg-amber-500" label="High" />
              <LegendItem color="bg-red-500" label="Urgent" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: number; icon: any; color: 'blue' | 'amber' | 'red' }) {
  const colors = {
    blue: "text-[#0066FF] bg-blue-50",
    amber: "text-amber-600 bg-amber-50",
    red: "text-red-600 bg-red-50"
  };
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex items-center gap-4">
      <div className={cn("w-12 h-12 rounded flex items-center justify-center", colors[color])}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{label}</p>
        <p className="text-2xl font-display font-bold">{value}</p>
      </div>
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={cn("w-2 h-2 rounded-full", color)}></div>
      <span className="text-[10px] font-bold uppercase text-gray-500">{label}</span>
    </div>
  );
}

function CaseTable({ cases, onSelect, selectedId }: { cases: Case[]; onSelect: (id: string) => void; selectedId: string | null }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      <table className="w-full bloomberg-grid">
        <thead>
          <tr>
            <th className="w-12"></th>
            <th className="w-32">ID</th>
            <th>Client / Agent</th>
            <th>Role</th>
            <th>Sub-Category</th>
            <th>Status</th>
            <th>Priority</th>
            <th>Next Follow-Up</th>
          </tr>
        </thead>
        <tbody>
          {cases.map(c => {
            const followUpDate = parseISO(c.nextFollowUpDate);
            const isOverdue = isBefore(followUpDate, startOfDay(new Date()));
            const isDueToday = isToday(followUpDate);
            
            return (
              <tr 
                key={c.id} 
                onClick={() => onSelect(c.id)}
                className={cn(
                  "cursor-pointer transition-colors",
                  selectedId === c.id ? "bg-blue-50" : "hover:bg-gray-50"
                )}
              >
                <td className="text-center">
                  <div className={cn("w-1.5 h-1.5 rounded-full mx-auto", STATUS_COLORS[c.status])}></div>
                </td>
                <td className="font-mono text-xs font-bold text-[#0066FF]">{c.id}</td>
                <td className="font-bold">{c.clientName}</td>
                <td>
                  <Badge className={c.role === 'SMD Base' ? "bg-purple-50 text-purple-600" : "bg-blue-50 text-blue-600"}>
                    {c.role}
                  </Badge>
                </td>
                <td className="text-xs text-gray-500">{c.subCategory}</td>
                <td>
                  <Badge className={cn("text-white", STATUS_COLORS[c.status])}>
                    {c.status}
                  </Badge>
                </td>
                <td className={cn("font-bold text-[10px] uppercase", PRIORITY_COLORS[c.priority])}>
                  {c.priority}
                </td>
                <td className={cn(
                  "font-mono text-xs font-bold",
                  isOverdue ? "text-red-500" : isDueToday ? "text-amber-500" : "text-gray-400"
                )}>
                  {format(followUpDate, 'yyyy-MM-dd')}
                </td>
              </tr>
            );
          })}
          {cases.length === 0 && (
            <tr>
              <td colSpan={8} className="py-20 text-center text-gray-400 font-mono text-xs">
                NO CASES FOUND IN TERMINAL
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function CaseDetail({ caseData, onClose, onEdit, onDelete, onAddLog, onUpdateStatus, onAppendNote }: { 
  caseData: Case; 
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onAddLog: () => void;
  onUpdateStatus: (status: Status) => void;
  onAppendNote: (note: string) => void;
}) {
  const [noteInput, setNoteInput] = useState('');

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold text-gray-400 uppercase">Case ID</span>
            <span className="text-xs font-mono font-bold text-[#0066FF]">{caseData.id}</span>
          </div>
          <h2 className="text-xl font-display font-bold tracking-tight">{caseData.clientName}</h2>
        </div>
        <div className="flex items-center gap-1">
          <IconButton icon={X} onClick={onClose} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={onAddLog}
            className="flex items-center justify-center gap-2 py-2 bg-gray-900 text-white rounded text-xs font-bold uppercase tracking-wider hover:bg-black transition-colors"
          >
            <Plus size={14} /> Add Log
          </button>
          <button 
            onClick={onEdit}
            className="flex items-center justify-center gap-2 py-2 border border-gray-200 rounded text-xs font-bold uppercase tracking-wider hover:bg-gray-50 transition-colors"
          >
            Edit Info
          </button>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-y-6 gap-x-4">
          <DetailItem label="Role" value={caseData.role} />
          <DetailItem label="Type" value={caseData.caseType} />
          <DetailItem label="Sub-Category" value={caseData.subCategory} />
          <DetailItem label="Priority" value={caseData.priority} color={PRIORITY_COLORS[caseData.priority]} />
          <DetailItem label="Submission Date" value={format(parseISO(caseData.submissionDate), 'MMM d, yyyy')} />
          <DetailItem label="Next Follow-Up" value={format(parseISO(caseData.nextFollowUpDate), 'MMM d, yyyy')} bold />
          <div className="col-span-2">
            <div className="flex items-center justify-between">
              <DetailItem label="Case Manager" value={caseData.caseManager} />
              <a 
                href={`mailto:${ASSISTANT_EMAIL}?subject=Inquiry: Case ${caseData.id} - ${caseData.clientName}`}
                className="flex items-center gap-1.5 text-[10px] font-bold text-[#0066FF] uppercase tracking-widest hover:underline"
              >
                <Mail size={12} /> Contact Assistant
              </a>
            </div>
          </div>
        </div>

        {/* Status Selector */}
        <div>
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Current Status</label>
          <div className="flex flex-wrap gap-2">
            {(['Inforce', 'Pending', 'Awaiting Response', 'Escalated', 'Closed'] as Status[]).map(s => (
              <button
                key={s}
                onClick={() => onUpdateStatus(s)}
                className={cn(
                  "px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border transition-all",
                  caseData.status === s 
                    ? cn("text-white border-transparent", STATUS_COLORS[s])
                    : "bg-white border-gray-200 text-gray-500 hover:border-gray-400"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Notes Section */}
        <div>
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Case Notes (Append-Only)</label>
          <div className="bg-gray-50 border border-gray-200 rounded p-3 font-mono text-[11px] whitespace-pre-wrap max-h-48 overflow-y-auto mb-3">
            {caseData.notes || "NO NOTES RECORDED"}
          </div>
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Add timestamped note..." 
              className="flex-1 border border-gray-200 rounded px-3 py-2 text-xs outline-none focus:border-[#0066FF]"
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && noteInput.trim()) {
                  onAppendNote(noteInput);
                  setNoteInput('');
                }
              }}
            />
            <button 
              onClick={() => { if(noteInput.trim()) { onAppendNote(noteInput); setNoteInput(''); } }}
              className="p-2 bg-gray-100 rounded text-gray-600 hover:bg-gray-200"
            >
              <Send size={14} />
            </button>
          </div>
        </div>

        {/* Follow-Up Log */}
        <div>
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 block">Follow-Up Log History</label>
          <div className="space-y-4">
            {caseData.followUpLog.map(log => (
              <div key={log.id} className="border-l-2 border-gray-200 pl-4 py-1 relative">
                <div className="absolute -left-[5px] top-2 w-2 h-2 rounded-full bg-gray-200"></div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono font-bold text-[#0066FF]">{format(parseISO(log.date), 'MMM d, yyyy')}</span>
                  <Badge className="bg-gray-100 text-gray-600">{log.method}</Badge>
                </div>
                <p className="text-xs font-bold mb-1">Contact: {log.contactName}</p>
                <div className="bg-gray-50 rounded p-2 text-[11px] font-mono text-gray-600">
                  <p className="mb-1"><span className="font-bold text-gray-400 uppercase">Outcome:</span> {log.outcome}</p>
                  <p><span className="font-bold text-gray-400 uppercase">Next Step:</span> {log.nextStep}</p>
                </div>
              </div>
            ))}
            {caseData.followUpLog.length === 0 && (
              <p className="text-center text-xs text-gray-400 font-mono py-4">NO LOG ENTRIES FOUND</p>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-gray-200 flex justify-between">
        <button 
          onClick={onDelete}
          className="flex items-center gap-2 text-[10px] font-bold text-red-500 uppercase tracking-widest hover:text-red-700 transition-colors"
        >
          <Trash2 size={12} /> Delete Case
        </button>
        <button 
          onClick={() => onUpdateStatus('Closed')}
          className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-gray-600 transition-colors"
        >
          <Archive size={12} /> Archive Case
        </button>
      </div>
    </div>
  );
}

function DetailItem({ label, value, color, bold }: { label: string; value: string; color?: string; bold?: boolean }) {
  return (
    <div>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">{label}</p>
      <p className={cn("text-sm", bold ? "font-bold" : "font-medium", color)}>{value}</p>
    </div>
  );
}

function CaseDrawer({ onClose, onSubmit, initialData }: { onClose: () => void; onSubmit: (data: any) => void; initialData?: Case | null }) {
  const [formData, setFormData] = useState({
    id: initialData?.id || '',
    clientName: initialData?.clientName || '',
    role: initialData?.role || 'SMD Base' as Role,
    caseType: initialData?.caseType || 'Life Policy' as CaseType,
    subCategory: initialData?.subCategory || SMD_BASE_SUBCATEGORIES[0],
    status: initialData?.status || 'Pending' as Status,
    priority: initialData?.priority || 'Medium' as Priority,
    caseManager: initialData?.caseManager || CASE_MANAGERS[0],
    submissionDate: initialData?.submissionDate || format(new Date(), 'yyyy-MM-dd'),
    nextFollowUpDate: initialData?.nextFollowUpDate || format(new Date(), 'yyyy-MM-dd'),
    notes: initialData?.notes || '',
  });

  const subCategories = formData.role === 'SMD Base' ? SMD_BASE_SUBCATEGORIES : LIFE_AGENT_SUBCATEGORIES;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        className="relative w-[500px] bg-white h-full shadow-2xl flex flex-col"
      >
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-display font-bold">{initialData ? 'Edit Case' : 'New Case Entry'}</h2>
          <IconButton icon={X} onClick={onClose} />
        </div>

        <form 
          className="flex-1 overflow-y-auto p-8 space-y-6"
          onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }}
        >
          <div className="space-y-4">
            <FormItem label="Case ID / Carrier Link">
              <input 
                required
                type="text" 
                className="w-full border border-gray-200 rounded px-3 py-2 text-sm font-mono focus:border-[#0066FF] outline-none"
                value={formData.id}
                onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                placeholder="e.g. WFG-123456"
              />
            </FormItem>

            <FormItem label="Client / Agent Name">
              <input 
                required
                type="text" 
                className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:border-[#0066FF] outline-none"
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
              />
            </FormItem>

            <div className="grid grid-cols-2 gap-4">
              <FormItem label="Role">
                <select 
                  className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:border-[#0066FF] outline-none"
                  value={formData.role}
                  onChange={(e) => {
                    const newRole = e.target.value as Role;
                    setFormData({ 
                      ...formData, 
                      role: newRole,
                      subCategory: newRole === 'SMD Base' ? SMD_BASE_SUBCATEGORIES[0] : LIFE_AGENT_SUBCATEGORIES[0]
                    });
                  }}
                >
                  <option value="SMD Base">SMD Base</option>
                  <option value="Life Agent">Life Agent</option>
                </select>
              </FormItem>
              {formData.role !== 'SMD Base' && (
                <FormItem label="Case Type">
                  <select 
                    className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:border-[#0066FF] outline-none"
                    value={formData.caseType}
                    onChange={(e) => setFormData({ ...formData, caseType: e.target.value as CaseType })}
                  >
                    <option value="Life Policy">Life Policy</option>
                    <option value="Annuity Policy">Annuity Policy</option>
                  </select>
                </FormItem>
              )}
            </div>

            <FormItem label="Sub-Category">
              <select 
                className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:border-[#0066FF] outline-none"
                value={formData.subCategory}
                onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
              >
                {subCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </FormItem>

            <div className="grid grid-cols-2 gap-4">
              <FormItem label="Status">
                <select 
                  className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:border-[#0066FF] outline-none"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as Status })}
                >
                  <option value="Inforce">Inforce</option>
                  <option value="Pending">Pending</option>
                  <option value="Awaiting Response">Awaiting Response</option>
                  <option value="Escalated">Escalated</option>
                  <option value="Closed">Closed</option>
                </select>
              </FormItem>
              <FormItem label="Priority">
                <select 
                  className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:border-[#0066FF] outline-none"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as Priority })}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </FormItem>
            </div>

            <FormItem label="Case Manager">
              <select 
                className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:border-[#0066FF] outline-none"
                value={formData.caseManager}
                onChange={(e) => setFormData({ ...formData, caseManager: e.target.value })}
              >
                {CASE_MANAGERS.map(mgr => <option key={mgr} value={mgr}>{mgr}</option>)}
              </select>
            </FormItem>

            <div className="grid grid-cols-2 gap-4">
              <FormItem label="Submission Date">
                <input 
                  type="date" 
                  className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:border-[#0066FF] outline-none"
                  value={formData.submissionDate}
                  onChange={(e) => setFormData({ ...formData, submissionDate: e.target.value })}
                />
              </FormItem>
              <FormItem label="Next Follow-Up Date">
                <input 
                  type="date" 
                  className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:border-[#0066FF] outline-none"
                  value={formData.nextFollowUpDate}
                  onChange={(e) => setFormData({ ...formData, nextFollowUpDate: e.target.value })}
                />
              </FormItem>
            </div>

            {!initialData && (
              <FormItem label="Initial Notes">
                <textarea 
                  className="w-full border border-gray-200 rounded px-3 py-2 text-sm h-24 focus:border-[#0066FF] outline-none"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Initial case details..."
                />
              </FormItem>
            )}
          </div>

          <div className="pt-8 flex gap-4">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-gray-200 rounded text-xs font-bold uppercase tracking-widest hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="flex-1 py-3 bg-[#0066FF] text-white rounded text-xs font-bold uppercase tracking-widest hover:bg-[#0052CC] transition-colors shadow-lg shadow-blue-100"
            >
              {initialData ? 'Update Case' : 'Create Case'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function FollowUpModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (data: any) => void }) {
  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    contactName: '',
    method: 'Call' as FollowUpMethod,
    outcome: '',
    nextStep: '',
  });

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full max-w-md bg-white rounded-lg shadow-2xl overflow-hidden"
      >
        <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <h2 className="text-lg font-display font-bold">Add Follow-Up Log</h2>
          <IconButton icon={X} onClick={onClose} />
        </div>

        <form 
          className="p-6 space-y-4"
          onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }}
        >
          <div className="grid grid-cols-2 gap-4">
            <FormItem label="Date">
              <input 
                type="date" 
                className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:border-[#0066FF] outline-none"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </FormItem>
            <FormItem label="Method">
              <select 
                className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:border-[#0066FF] outline-none"
                value={formData.method}
                onChange={(e) => setFormData({ ...formData, method: e.target.value as FollowUpMethod })}
              >
                <option value="Call">Call</option>
                <option value="Email">Email</option>
                <option value="WeChat">WeChat</option>
                <option value="Telegram">Telegram</option>
              </select>
            </FormItem>
          </div>

          <FormItem label="Contact Name">
            <input 
              required
              type="text" 
              className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:border-[#0066FF] outline-none"
              value={formData.contactName}
              onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
            />
          </FormItem>

          <FormItem label="Outcome / Result">
            <textarea 
              required
              className="w-full border border-gray-200 rounded px-3 py-2 text-sm h-20 focus:border-[#0066FF] outline-none"
              value={formData.outcome}
              onChange={(e) => setFormData({ ...formData, outcome: e.target.value })}
            />
          </FormItem>

          <FormItem label="Next Step">
            <input 
              required
              type="text" 
              className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:border-[#0066FF] outline-none"
              value={formData.nextStep}
              onChange={(e) => setFormData({ ...formData, nextStep: e.target.value })}
            />
          </FormItem>

          <div className="pt-4 flex gap-3">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-gray-200 rounded text-xs font-bold uppercase tracking-widest hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="flex-1 py-2.5 bg-gray-900 text-white rounded text-xs font-bold uppercase tracking-widest hover:bg-black transition-colors"
            >
              Save Log
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function FormItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">{label}</label>
      {children}
    </div>
  );
}

export default function App() {
  const { cases, addCase, updateCase, deleteCase, addFollowUp, appendNote } = useCases();
  const [activeView, setActiveView] = useState<'dashboard' | 'cases' | 'due'>('dashboard');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingCase, setEditingCase] = useState<Case | null>(null);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<Role | 'All'>('All');
  const [statusFilter, setStatusFilter] = useState<Status | 'All'>('All');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'All'>('All');

  const selectedCase = useMemo(() => 
    cases.find(c => c.id === selectedCaseId), 
    [cases, selectedCaseId]
  );

  const filteredCases = useMemo(() => {
    return cases
      .filter(c => !c.archived)
      .filter(c => {
        const matchesSearch = c.clientName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             c.id.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = roleFilter === 'All' || c.role === roleFilter;
        const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
        const matchesPriority = priorityFilter === 'All' || c.priority === priorityFilter;
        
        if (activeView === 'due') {
          const today = startOfDay(new Date());
          const followUpDate = startOfDay(parseISO(c.nextFollowUpDate));
          return matchesSearch && matchesRole && matchesStatus && matchesPriority && 
                 (isToday(followUpDate) || isBefore(followUpDate, today));
        }
        
        return matchesSearch && matchesRole && matchesStatus && matchesPriority;
      })
      .sort((a, b) => {
        // Urgent first
        if (a.priority === 'Urgent' && b.priority !== 'Urgent') return -1;
        if (a.priority !== 'Urgent' && b.priority === 'Urgent') return 1;
        // Then by Next Follow-Up Date ascending
        return parseISO(a.nextFollowUpDate).getTime() - parseISO(b.nextFollowUpDate).getTime();
      });
  }, [cases, searchQuery, roleFilter, statusFilter, priorityFilter, activeView]);

  const stats = useMemo(() => {
    const activeCases = cases.filter(c => !c.archived);
    const karma = activeCases.filter(c => c.role === 'Karma Ops');
    const life = activeCases.filter(c => c.role === 'Life Agent');

    const getCounts = (list: Case[]) => ({
      open: list.filter(c => c.status === 'Inforce').length,
      pending: list.filter(c => c.status === 'Pending').length,
      awaiting: list.filter(c => c.status === 'Awaiting Response').length,
      urgent: list.filter(c => c.priority === 'Urgent').length,
    });

    return {
      karma: getCounts(karma),
      life: getCounts(life),
      total: activeCases.length,
      dueToday: activeCases.filter(c => isToday(parseISO(c.nextFollowUpDate))).length,
      overdue: activeCases.filter(c => isBefore(parseISO(c.nextFollowUpDate), startOfDay(new Date()))).length,
    };
  }, [cases]);

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8F9FA]">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 bg-[#0066FF] rounded flex items-center justify-center text-white">
              <ShieldCheck size={20} />
            </div>
            <h1 className="text-xl font-display font-bold tracking-tight">LifeGuard</h1>
          </div>
          <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Dual-Role CRM Terminal</p>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <NavItem 
            icon={LayoutDashboard} 
            label="Dashboard" 
            active={activeView === 'dashboard'} 
            onClick={() => { setActiveView('dashboard'); setSelectedCaseId(null); }} 
          />
          <NavItem 
            icon={Briefcase} 
            label="All Cases" 
            active={activeView === 'cases'} 
            onClick={() => { setActiveView('cases'); setSelectedCaseId(null); }} 
          />
          <NavItem 
            icon={Clock} 
            label="Due / Overdue" 
            active={activeView === 'due'} 
            badge={stats.dueToday + stats.overdue}
            onClick={() => { setActiveView('due'); setSelectedCaseId(null); }} 
          />
          
          <div className="pt-6 pb-2 px-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Roles</div>
          <RoleItem 
            icon={UserCheck} 
            label="SMD Base" 
            count={stats.karma.pending + stats.karma.awaiting + stats.karma.urgent}
            active={roleFilter === 'SMD Base'}
            onClick={() => setRoleFilter(roleFilter === 'SMD Base' ? 'All' : 'SMD Base')}
          />
          <RoleItem 
            icon={ShieldCheck} 
            label="Life Agent" 
            count={stats.life.pending + stats.life.awaiting + stats.life.urgent}
            active={roleFilter === 'Life Agent'}
            onClick={() => setRoleFilter(roleFilter === 'Life Agent' ? 'All' : 'Life Agent')}
          />
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button 
            onClick={() => { setEditingCase(null); setIsDrawerOpen(true); }}
            className="w-full py-2.5 bg-[#0066FF] text-white rounded font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#0052CC] transition-colors shadow-sm"
          >
            <Plus size={18} />
            NEW CASE
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 z-10">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-display font-bold capitalize">{activeView.replace('-', ' ')}</h2>
            {activeView !== 'dashboard' && (
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded px-2 py-1">
                <Search size={14} className="text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Filter cases..." 
                  className="bg-transparent border-none outline-none text-xs w-48 font-mono"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-[10px] font-mono font-bold text-gray-400 uppercase">Live Connection</span>
            </div>
            <div className="h-8 w-px bg-gray-200"></div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs font-bold">WFG Agent Portal</p>
                <p className="text-[10px] text-gray-400 font-mono">ID: 8829-XJ</p>
              </div>
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                <UserCheck size={18} />
              </div>
            </div>
          </div>
        </header>

        {/* View Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {activeView === 'dashboard' ? (
            <Dashboard stats={stats} cases={cases} />
          ) : (
            <div className="flex gap-8 h-full">
              <div className={cn("flex-1 min-w-0 transition-all duration-300", selectedCaseId ? "w-1/2" : "w-full")}>
                <CaseTable 
                  cases={filteredCases} 
                  onSelect={setSelectedCaseId} 
                  selectedId={selectedCaseId}
                />
              </div>
              
              <AnimatePresence>
                {selectedCase && (
                  <motion.div 
                    initial={{ x: 300, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 300, opacity: 0 }}
                    className="w-[450px] bg-white border border-gray-200 rounded-lg shadow-xl flex flex-col overflow-hidden"
                  >
                    <CaseDetail 
                      caseData={selectedCase} 
                      onClose={() => setSelectedCaseId(null)}
                      onEdit={() => { setEditingCase(selectedCase); setIsDrawerOpen(true); }}
                      onDelete={() => { if(confirm('Delete this case?')) { deleteCase(selectedCase.id); setSelectedCaseId(null); } }}
                      onAddLog={() => setIsFollowUpModalOpen(true)}
                      onUpdateStatus={(status) => updateCase(selectedCase.id, { status })}
                      onAppendNote={(note) => appendNote(selectedCase.id, note)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </main>

      {/* Modals & Drawers */}
      <AnimatePresence>
        {isDrawerOpen && (
          <CaseDrawer 
            onClose={() => setIsDrawerOpen(false)} 
            onSubmit={(data) => {
              if (editingCase) {
                updateCase(editingCase.id, data);
              } else {
                addCase(data as any);
              }
              setIsDrawerOpen(false);
            }}
            initialData={editingCase}
          />
        )}
        {isFollowUpModalOpen && selectedCase && (
          <FollowUpModal 
            onClose={() => setIsFollowUpModalOpen(false)}
            onSubmit={(entry) => {
              addFollowUp(selectedCase.id, entry);
              setIsFollowUpModalOpen(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
