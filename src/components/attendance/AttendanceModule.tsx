import React, { useState, useMemo } from 'react';
import QRCode from 'qrcode';
import { GymMember, AttendanceRecord, UserRole, ThemeMode } from '../../types/gym';
import {
  Users,
  UserCheck,
  UserX,
  Search,
  CheckCircle2,
  Calendar,
  Clock,
  Download,
  Flame,
  Shield,
  CreditCard,
  LogOut,
  QrCode,
  Sparkles,
  AlertCircle,
  Crown,
} from 'lucide-react';
import { sounds } from '../../utils/audio';

interface AttendanceModuleProps {
  currentMember: GymMember;
  allMembers: GymMember[];
  attendanceLogs: AttendanceRecord[];
  userRole: UserRole;
  theme: ThemeMode;
  onCheckInMember: (memberId: string, method: 'QR_CODE' | 'MANUAL') => void;
  onCheckOutMember: (memberId: string) => void;
}

export const AttendanceModule: React.FC<AttendanceModuleProps> = ({
  currentMember,
  allMembers,
  attendanceLogs,
  userRole,
  theme,
  onCheckInMember,
  onCheckOutMember,
}) => {
  const isDark = theme === 'dark';

  // Primary view: default to 'desk' (Daily Front Desk Attendance Register)
  const [activeTab, setActiveTab] = useState<'desk' | 'card'>('desk');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'present' | 'absent'>('all');
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Digital Pass QR Data URL state (for the secondary card tab)
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

  // Generate dynamic QR Code for member card tab
  React.useEffect(() => {
    const payload = JSON.stringify({
      club: 'GYMX_ATHLETIC_CLUB',
      memberId: currentMember.membershipId,
      name: currentMember.name,
      tier: currentMember.membershipTier,
    });

    QRCode.toDataURL(payload, {
      width: 220,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    })
      .then((url) => setQrCodeDataUrl(url))
      .catch((err) => console.error('QR generation error:', err));
  }, [currentMember]);

  // Attendance logs for selected date
  const logsForSelectedDate = useMemo(() => {
    return attendanceLogs.filter((log) => log.dateStr === selectedDate);
  }, [attendanceLogs, selectedDate]);

  // Map of present members on selected date
  const presentMemberMap = useMemo(() => {
    const map = new Map<string, AttendanceRecord>();
    logsForSelectedDate.forEach((log) => {
      map.set(log.memberId, log);
    });
    return map;
  }, [logsForSelectedDate]);

  // Filtered members list
  const filteredMembers = useMemo(() => {
    return allMembers.filter((m) => {
      const matchesSearch =
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.membershipId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.membershipTier.toLowerCase().includes(searchQuery.toLowerCase());

      const isPresent = presentMemberMap.has(m.id) || m.isCurrentlyInside;

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'present' && isPresent) ||
        (statusFilter === 'absent' && !isPresent);

      return matchesSearch && matchesStatus;
    });
  }, [allMembers, searchQuery, statusFilter, presentMemberMap]);

  // Statistics
  const totalMembers = allMembers.length;
  const presentCount = allMembers.filter((m) => presentMemberMap.has(m.id) || m.isCurrentlyInside).length;
  const absentCount = Math.max(0, totalMembers - presentCount);
  const currentlyInsideCount = allMembers.filter((m) => m.isCurrentlyInside).length;

  // Show Toast
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Handle Marking Attendance Present
  const handleMarkPresent = (member: GymMember) => {
    sounds.playCheckInSuccess();
    onCheckInMember(member.id, 'MANUAL');
    triggerToast(`✅ ${member.name} marked Present! Check-in recorded.`);
  };

  // Handle Check Out
  const handleCheckOut = (member: GymMember) => {
    sounds.playClick();
    onCheckOutMember(member.id);
    triggerToast(`👋 ${member.name} checked out.`);
  };

  // Export CSV Report
  const handleExportCSV = () => {
    sounds.playClick();
    const headers = 'Member ID,Name,Tier,Status,Date,Time,Streak\n';
    const rows = allMembers
      .map((m) => {
        const isPresent = presentMemberMap.has(m.id) || m.isCurrentlyInside;
        const log = presentMemberMap.get(m.id);
        const time = log ? log.timeStr : isPresent ? '08:30 AM' : '-';
        return `"${m.membershipId}","${m.name}","${m.membershipTier}","${
          isPresent ? 'Present' : 'Absent'
        }","${selectedDate}","${time}","${m.currentStreak} days"`;
      })
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GymX-Attendance-Register-${selectedDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    triggerToast('📥 Attendance roster exported as CSV successfully!');
  };

  return (
    <div id="attendance-module" className="space-y-4 pb-20 animate-fadeIn">
      {/* Toast Alert Banner */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-zinc-900 text-white border border-emerald-500 shadow-2xl flex items-center gap-2 text-xs font-bold animate-slideDown">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Main Navigation Tabs: Desk Register vs Member Digital Card */}
      <div
        className={`p-1 rounded-2xl border flex items-center gap-1 ${
          isDark ? 'bg-zinc-900/90 border-zinc-800' : 'bg-zinc-100 border-zinc-200'
        }`}
      >
        <button
          id="tab-reception-desk"
          onClick={() => {
            sounds.playClick();
            setActiveTab('desk');
          }}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'desk'
              ? 'bg-emerald-500 text-white shadow-md font-extrabold'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Front Desk Register (Daily Attendance)</span>
        </button>

        <button
          id="tab-member-card"
          onClick={() => {
            sounds.playClick();
            setActiveTab('card');
          }}
          className={`py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'card'
              ? 'bg-emerald-500 text-white shadow-md font-extrabold'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Member ID Card</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: FRONT DESK ATTENDANCE REGISTER (DEFAULT) */}
      {/* ========================================================================= */}
      {activeTab === 'desk' && (
        <div className="space-y-4">
          {/* Desk Header & Date Controller */}
          <div
            className={`p-4 sm:p-5 rounded-3xl border ${
              isDark
                ? 'bg-[#121316] border-zinc-800/80 shadow-lg shadow-black/50'
                : 'bg-white border-zinc-200 shadow-sm'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono">
                    Gym Front Desk
                  </span>
                  <span className="text-xs text-zinc-400 font-medium">Daily Attendance Roster</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight font-display text-white mt-1">
                  Gym Member Attendance Register
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Search any member by name or APX-ID and record attendance with a single click.
                </p>
              </div>

              {/* Date Selector & CSV Export */}
              <div className="flex items-center gap-2">
                <div
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-2xl border ${
                    isDark ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-zinc-50 border-zinc-300 text-zinc-900'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="bg-transparent text-xs font-bold focus:outline-none cursor-pointer"
                    title="Attendance Date"
                  />
                </div>

                <button
                  id="export-csv-btn"
                  onClick={handleExportCSV}
                  className={`px-3 py-1.5 rounded-2xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    isDark
                      ? 'bg-zinc-900 hover:bg-zinc-800 border-zinc-700 text-zinc-200'
                      : 'bg-zinc-100 hover:bg-zinc-200 border-zinc-300 text-zinc-800'
                  }`}
                  title="Download Attendance Sheet as CSV"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden xs:inline">Export CSV</span>
                </button>
              </div>
            </div>

            {/* 4 Attendance Summary Counters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 pt-4 border-t border-zinc-800/60">
              <div
                className={`p-3 rounded-2xl border ${
                  isDark ? 'bg-zinc-900/60 border-zinc-800/80' : 'bg-zinc-50 border-zinc-200'
                }`}
              >
                <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold">
                  <span>Total Members</span>
                  <Users className="w-3.5 h-3.5 text-zinc-500" />
                </div>
                <div className="text-2xl font-black font-display text-white mt-1">{totalMembers}</div>
                <div className="text-[10px] text-zinc-500 mt-0.5">Registered Athletes</div>
              </div>

              <div
                className={`p-3 rounded-2xl border ${
                  isDark ? 'bg-zinc-900/60 border-zinc-800/80' : 'bg-zinc-50 border-zinc-200'
                }`}
              >
                <div className="flex items-center justify-between text-emerald-400 text-xs font-bold">
                  <span>Present Today</span>
                  <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="text-2xl font-black font-display text-emerald-400 mt-1">{presentCount}</div>
                <div className="text-[10px] text-zinc-400 mt-0.5">Checked-in Members</div>
              </div>

              <div
                className={`p-3 rounded-2xl border ${
                  isDark ? 'bg-zinc-900/60 border-zinc-800/80' : 'bg-zinc-50 border-zinc-200'
                }`}
              >
                <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold">
                  <span>Absent Today</span>
                  <UserX className="w-3.5 h-3.5 text-zinc-500" />
                </div>
                <div className="text-2xl font-black font-display text-zinc-300 mt-1">{absentCount}</div>
                <div className="text-[10px] text-zinc-500 mt-0.5">Not Checked In</div>
              </div>

              <div
                className={`p-3 rounded-2xl border ${
                  isDark ? 'bg-zinc-900/60 border-zinc-800/80' : 'bg-zinc-50 border-zinc-200'
                }`}
              >
                <div className="flex items-center justify-between text-emerald-400 text-xs font-semibold">
                  <span>Inside Gym Now</span>
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="text-2xl font-black font-display text-white mt-1">
                  {currentlyInsideCount}
                </div>
                <div className="text-[10px] text-zinc-500 mt-0.5">Active Workout</div>
              </div>
            </div>
          </div>

          {/* Search Bar & Filter Tabs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                id="receptionist-member-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search member by Name, APX-ID, or Tier..."
                className={`w-full pl-10 pr-4 py-2.5 rounded-2xl border text-xs font-medium transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  isDark
                    ? 'bg-[#121316] border-zinc-800 text-white placeholder-zinc-500'
                    : 'bg-white border-zinc-200 text-zinc-900 placeholder-zinc-400'
                }`}
              />
            </div>

            {/* Filter Chips */}
            <div
              className={`flex items-center p-1 rounded-2xl border shrink-0 ${
                isDark ? 'bg-[#121316] border-zinc-800' : 'bg-zinc-100 border-zinc-200'
              }`}
            >
              <button
                onClick={() => {
                  sounds.playClick();
                  setStatusFilter('all');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === 'all'
                    ? 'bg-emerald-500 text-white shadow-sm font-extrabold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                All ({allMembers.length})
              </button>
              <button
                onClick={() => {
                  sounds.playClick();
                  setStatusFilter('present');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === 'present'
                    ? 'bg-emerald-500 text-white shadow-sm font-extrabold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Present ({presentCount})
              </button>
              <button
                onClick={() => {
                  sounds.playClick();
                  setStatusFilter('absent');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === 'absent'
                    ? 'bg-emerald-500 text-white shadow-sm font-extrabold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Absent ({absentCount})
              </button>
            </div>
          </div>

          {/* Member Attendance Register List */}
          <div
            className={`rounded-3xl border overflow-hidden ${
              isDark ? 'bg-[#121316] border-zinc-800/80 shadow-md' : 'bg-white border-zinc-200 shadow-sm'
            }`}
          >
            <div className="px-5 py-3.5 border-b border-zinc-800/60 flex items-center justify-between bg-zinc-900/40">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" />
                <h3 className="font-extrabold text-sm tracking-tight text-white font-display">
                  Gym Members Attendance List ({filteredMembers.length})
                </h3>
              </div>
              <span className="text-[11px] text-zinc-400 font-mono">Date: {selectedDate}</span>
            </div>

            {filteredMembers.length === 0 ? (
              <div className="p-10 text-center">
                <Users className="w-10 h-10 mx-auto text-zinc-600 mb-2 opacity-50" />
                <p className="text-sm font-bold text-zinc-300">No members found</p>
                <p className="text-xs text-zinc-500 mt-1">
                  Try adjusting your search query or reset the filter.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-800/60">
                {filteredMembers.map((member) => {
                  const log = presentMemberMap.get(member.id);
                  const isPresent = !!log || member.isCurrentlyInside;
                  const checkInTime = log
                    ? log.timeStr
                    : isPresent
                    ? '08:30 AM'
                    : null;

                  return (
                    <div
                      key={member.id}
                      id={`attendance-member-row-${member.id}`}
                      className={`p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                        isPresent
                          ? isDark
                            ? 'bg-zinc-900/25 hover:bg-zinc-900/50'
                            : 'bg-red-50/20 hover:bg-red-50/40'
                          : isDark
                          ? 'hover:bg-zinc-900/40'
                          : 'hover:bg-zinc-50'
                      }`}
                    >
                      {/* Member Info */}
                      <div className="flex items-center gap-3.5">
                        <div className="relative shrink-0">
                          <img
                            src={member.avatarUrl}
                            alt={member.name}
                            referrerPolicy="no-referrer"
                            className="w-12 h-12 rounded-2xl object-cover border-2 border-zinc-700/60 shadow-md"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
                            }}
                          />
                          {isPresent ? (
                            <div className="w-3.5 h-3.5 rounded-full absolute -bottom-1 -right-1 border-2 border-black bg-emerald-500 animate-pulse" />
                          ) : (
                            <div className="w-3.5 h-3.5 rounded-full absolute -bottom-1 -right-1 bg-zinc-600 border-2 border-black" />
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-extrabold text-sm sm:text-base tracking-tight text-white font-display">
                              {member.name}
                            </h4>
                            <span
                              className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase border font-mono ${
                                member.membershipTier.includes('VIP')
                                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                                  : member.membershipTier.includes('Pro')
                                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                  : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                              }`}
                            >
                              {member.membershipTier}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-xs text-zinc-400 mt-1 flex-wrap font-mono">
                            <span className="text-[11px] text-zinc-500 font-bold">
                              ID: {member.membershipId}
                            </span>
                            <span className="text-[11px] text-zinc-300">
                              🔥 Streak: <strong className="text-emerald-400">{member.currentStreak}d</strong>
                            </span>
                            <span className="text-[11px] text-zinc-500">
                              Visits: {member.totalVisits}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Status Display & Action Button */}
                      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-800/40">
                        {/* Status Label */}
                        <div className="text-left sm:text-right">
                          {isPresent ? (
                            <div>
                              <div className="flex items-center gap-1.5 sm:justify-end">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-xs font-black text-emerald-400">
                                  PRESENT
                                </span>
                              </div>
                              <div className="text-[11px] text-zinc-400 font-mono mt-0.5">
                                Check-in: <span className="text-white font-bold">{checkInTime}</span>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <span className="text-xs font-bold text-zinc-500 flex items-center gap-1 sm:justify-end">
                                <span className="w-2 h-2 rounded-full bg-zinc-600" />
                                ABSENT
                              </span>
                              <span className="text-[10px] text-zinc-600 block mt-0.5">
                                Not checked in yet
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        {isPresent ? (
                          <div className="flex items-center gap-1.5">
                            <button
                              id={`checkout-${member.id}`}
                              onClick={() => handleCheckOut(member)}
                              className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer ${
                                isDark
                                  ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-zinc-700'
                                  : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border-zinc-300'
                              }`}
                              title="Check Out Member"
                            >
                              <LogOut className="w-3.5 h-3.5 text-zinc-400" />
                              <span>Check Out</span>
                            </button>
                            <div
                              className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0"
                              title="Verified Present Today"
                            >
                              <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                            </div>
                          </div>
                        ) : (
                          <button
                            id={`mark-present-${member.id}`}
                            onClick={() => handleMarkPresent(member)}
                            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-extrabold text-xs flex items-center gap-2 shadow-md shadow-emerald-950/50 transition-all active:scale-95 shrink-0 cursor-pointer"
                            title="Mark Attendance Present for this Member"
                          >
                            <UserCheck className="w-4 h-4 stroke-[2.5]" />
                            <span>Mark Present</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Front Desk Guidance Box */}
          <div
            className={`p-4 rounded-2xl border text-xs flex items-start gap-3 ${
              isDark ? 'bg-zinc-900/40 border-zinc-800 text-zinc-400' : 'bg-zinc-50 border-zinc-200 text-zinc-600'
            }`}
          >
            <AlertCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white font-bold block mb-0.5">
                Front Desk Attendance Instructions:
              </strong>
              Search for any member by name or APX-ID and click{' '}
              <span className="text-emerald-400 font-bold">"Mark Present"</span>. Their check-in timestamp
              and streak will update immediately. To save or download the daily roster, click the{' '}
              <span className="text-white font-bold">"Export CSV"</span> button above.
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: MEMBER DIGITAL PASS (SECONDARY PREVIEW) */}
      {/* ========================================================================= */}
      {activeTab === 'card' && (
        <div className="space-y-4 max-w-md mx-auto">
          <div
            id="digital-gym-card"
            className="p-6 rounded-[28px] bg-gradient-to-br from-zinc-950 via-zinc-900 to-black border border-emerald-500/40 shadow-2xl relative overflow-hidden text-white"
          >
            <div className="flex items-start justify-between relative z-10 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500 p-[1.5px] shadow-lg flex items-center justify-center">
                  <Crown className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-black text-sm tracking-wider font-display text-white">GYMX ATHLETIC CLUB</h3>
                  <span className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-widest font-mono">
                    {currentMember.membershipTier}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-center space-y-3">
              <div className="flex items-center justify-center gap-3">
                <img
                  src={currentMember.avatarUrl}
                  alt={currentMember.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500/60 shadow-md"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
                  }}
                />
                <div className="text-left">
                  <h4 className="font-extrabold text-base text-white">{currentMember.name}</h4>
                  <p className="text-xs font-mono text-emerald-400">ID: {currentMember.membershipId}</p>
                </div>
              </div>

              {qrCodeDataUrl && (
                <div className="flex justify-center p-2 bg-white rounded-xl w-fit mx-auto shadow-md">
                  <img src={qrCodeDataUrl} alt="Member QR Code" className="w-40 h-40 object-contain" />
                </div>
              )}

              <p className="text-[11px] text-zinc-400 font-mono">
                Digital Pass • Streak: {currentMember.currentStreak} Days • Scan at Front Desk Turnstile
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
