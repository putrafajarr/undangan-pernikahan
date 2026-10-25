import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Users, CheckCircle, XCircle, Utensils, MessageSquare, 
  Download, Share2, Send, Trash2, Settings, Sparkles, Lock, 
  Unlock, Plus, Phone, ExternalLink, RefreshCw, ShieldCheck,
  MapPin, Navigation, CreditCard, Search, Copy, Check, 
  Calendar, Clock, Music, Save, UserCheck, Heart, AlertCircle,
  Edit3, RotateCcw, Quote, Upload, Play, Pause, Volume2
} from 'lucide-react';
import { getApiUrl } from '../config/api';

export default function AdminModal({ isOpen, onClose, invitationData, onUpdateInvitation }) {
  const getAdminToken = () => {
    return sessionStorage.getItem('wedding_admin_token') || localStorage.getItem('wedding_admin_token') || '';
  };

  const setAdminToken = (token) => {
    if (token) {
      sessionStorage.setItem('wedding_admin_token', token);
      localStorage.setItem('wedding_admin_token', token);
    } else {
      sessionStorage.removeItem('wedding_admin_token');
      localStorage.removeItem('wedding_admin_token');
    }
  };

  const getDeletedGuestIds = () => {
    try {
      return JSON.parse(localStorage.getItem('wedding_deleted_guests') || '[]');
    } catch {
      return [];
    }
  };

  const getDeletedWishIds = () => {
    try {
      return JSON.parse(localStorage.getItem('wedding_deleted_wishes') || '[]');
    } catch {
      return [];
    }
  };

  const addDeletedGuestId = (id) => {
    const list = getDeletedGuestIds();
    if (!list.includes(String(id))) {
      list.push(String(id));
      localStorage.setItem('wedding_deleted_guests', JSON.stringify(list));
    }
  };

  const addDeletedWishId = (id) => {
    const list = getDeletedWishIds();
    if (!list.includes(String(id))) {
      list.push(String(id));
      localStorage.setItem('wedding_deleted_wishes', JSON.stringify(list));
    }
  };

  const getCustomGuests = () => {
    try {
      return JSON.parse(localStorage.getItem('wedding_custom_guests') || '[]');
    } catch {
      return [];
    }
  };

  const saveCustomGuest = (guest) => {
    const list = getCustomGuests();
    if (!list.some((g) => String(g.id) === String(guest.id))) {
      list.push(guest);
      localStorage.setItem('wedding_custom_guests', JSON.stringify(list));
    }
  };

  const removeCustomGuest = (id) => {
    const list = getCustomGuests().filter((g) => String(g.id) !== String(id));
    localStorage.setItem('wedding_custom_guests', JSON.stringify(list));
  };

  const [sentGuestIds, setSentGuestIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('wedding_sent_guests') || '[]');
    } catch {
      return [];
    }
  });

  const toggleGuestSent = (id) => {
    setSentGuestIds((prev) => {
      const idStr = String(id);
      const next = prev.includes(idStr)
        ? prev.filter((x) => x !== idStr)
        : [...prev, idStr];
      localStorage.setItem('wedding_sent_guests', JSON.stringify(next));
      return next;
    });
  };

  const markGuestAsSent = (id) => {
    setSentGuestIds((prev) => {
      const idStr = String(id);
      if (!prev.includes(idStr)) {
        const next = [...prev, idStr];
        localStorage.setItem('wedding_sent_guests', JSON.stringify(next));
        return next;
      }
      return prev;
    });
  };

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return Boolean(getAdminToken() && localStorage.getItem('wedding_admin_auth') === 'true');
  });
  const [usernameInput, setUsernameInput] = useState('admin');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Authenticated fetch helper with automatic 401 session expiry handling
  const adminFetch = async (url, options = {}) => {
    const token = getAdminToken();
    const headers = {
      ...(options.headers || {}),
      'Authorization': `Bearer ${token}`
    };
    const res = await fetch(getApiUrl(url), { ...options, headers });
    if (res.status === 401) {
      setIsAuthenticated(false);
      setAdminToken('');
      localStorage.removeItem('wedding_admin_auth');
      setLoginError('Sesi login telah berakhir. Silakan login kembali.');
      throw new Error('Sesi login telah berakhir');
    }
    return res;
  };

  const [activeTab, setActiveTab] = useState('stats'); // 'stats' | 'generator' | 'wishes' | 'settings'
  const [stats, setStats] = useState(null);
  const [wishes, setWishes] = useState([]);
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Search & Filter state
  const [guestSearchQuery, setGuestSearchQuery] = useState('');
  const [wishSearchQuery, setWishSearchQuery] = useState('');
  const [wishFilterAttendance, setWishFilterAttendance] = useState('all');
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isCopiedWa, setIsCopiedWa] = useState(false);

  // WhatsApp Generator form & customizable message template
  const [guestNameInput, setGuestNameInput] = useState('');
  const [guestPhoneInput, setGuestPhoneInput] = useState('');
  const [guestGroupInput, setGuestGroupInput] = useState('Umum');
  const [waTemplate, setWaTemplate] = useState(() => {
    return localStorage.getItem('wedding_wa_template') || '';
  });
  const [isTemplateDirty, setIsTemplateDirty] = useState(false);
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);

  // Settings form state
  const [settingsForm, setSettingsForm] = useState({
    quoteArabic: '',
    quoteTranslation: '',
    quoteSource: '',
    groomFullName: '',
    groomShortName: '',
    groomOrderNumber: 'Putra pertama dari',
    groomFather: '',
    groomMother: '',
    brideFullName: '',
    brideShortName: '',
    brideOrderNumber: 'Putri kedua dari',
    brideFather: '',
    brideMother: '',
    countdownTitle: 'Menghitung Hari Bahagia',
    countdownTarget: '',
    akadDate: '',
    akadTime: '',
    akadVenue: '',
    akadAddress: '',
    akadMapsUrl: '',
    resepsiTitle: '',
    resepsiDate: '',
    resepsiTime: '',
    resepsiVenue: '',
    resepsiAddress: '',
    resepsiMapsUrl: '',
    mapsEmbedUrl: '',
    bankAccounts: [],
    physicalAddress: '',
    audioUrl: ''
  });

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Audio upload & preview state
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);
  const [audioUploadProgress, setAudioUploadProgress] = useState('');
  const [previewPlaying, setPreviewPlaying] = useState(false);
  const previewAudioRef = useRef(null);
  const fileInputRef = useRef(null);

  const isYouTubeUrl = (url) => {
    if (!url || typeof url !== 'string') return false;
    return url.includes('youtube.com') || url.includes('youtu.be');
  };

  const handleAudioFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/x-m4a', 'audio/m4a'];
    const isAudio = validTypes.includes(file.type) || file.name.match(/\.(mp3|m4a|wav|ogg)$/i);
    if (!isAudio) {
      showToast('Harap pilih file audio berformat .mp3, .m4a, atau .wav');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      showToast('Ukuran file maksimal 25 MB');
      return;
    }

    setIsUploadingAudio(true);
    setAudioUploadProgress('Menghubungkan ke storage...');

    try {
      // 1. Dapatkan signed upload URL untuk Supabase Storage
      const signRes = await adminFetch('/api/audio/upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type || 'audio/mpeg'
        })
      });

      const signJson = await signRes.json();
      let uploadedPublicUrl = null;

      if (signJson.success && signJson.uploadUrl) {
        setAudioUploadProgress(`Mengunggah "${file.name}"...`);
        const putRes = await fetch(signJson.uploadUrl, {
          method: 'PUT',
          headers: { 'Content-Type': file.type || 'audio/mpeg' },
          body: file
        });

        if (putRes.ok) {
          uploadedPublicUrl = signJson.publicUrl;
        }
      }

      // 2. Fallback direct upload jika signed URL terkendala
      if (!uploadedPublicUrl) {
        setAudioUploadProgress('Mengunggah ke server cadangan...');
        const base64Data = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        const directRes = await adminFetch('/api/audio/upload-direct', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: file.name,
            base64Data,
            contentType: file.type || 'audio/mpeg'
          })
        });
        const directJson = await directRes.json();
        if (directJson.success) {
          uploadedPublicUrl = directJson.publicUrl;
        } else {
          throw new Error(directJson.message || 'Gagal mengupload audio');
        }
      }

      if (uploadedPublicUrl) {
        setSettingsForm(prev => ({
          ...prev,
          audioUrl: uploadedPublicUrl
        }));
        if (previewAudioRef.current) {
          previewAudioRef.current.pause();
          setPreviewPlaying(false);
        }
        showToast(`Lagu "${file.name}" berhasil diupload! Klik "Simpan Semua Perubahan" untuk mengaktifkan.`);
      }
    } catch (err) {
      console.error('Audio upload error:', err);
      showToast(`Gagal mengunggah audio: ${err.message || 'Kesalahan jaringan'}`);
    } finally {
      setIsUploadingAudio(false);
      setAudioUploadProgress('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleResetToDefaultAudio = () => {
    setSettingsForm(prev => ({
      ...prev,
      audioUrl: '/audio/wedding-song.mp3'
    }));
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
      setPreviewPlaying(false);
    }
    showToast('Musik dikembalikan ke lagu bawaan romantis!');
  };

  const handleTogglePreviewAudio = () => {
    if (!previewAudioRef.current) return;
    if (previewPlaying) {
      previewAudioRef.current.pause();
      setPreviewPlaying(false);
    } else {
      const targetSrc = settingsForm.audioUrl || '/audio/wedding-song.mp3';
      if (isYouTubeUrl(targetSrc)) {
        showToast('Link YouTube tidak dapat diputar sebagai audio preview!');
        return;
      }
      previewAudioRef.current.src = targetSrc;
      previewAudioRef.current.play().then(() => {
        setPreviewPlaying(true);
      }).catch(() => {
        showToast('Gagal memutar audio preview');
      });
    }
  };

  // Helper actions for dynamic bank accounts
  const handleAddBankAccount = () => {
    const defaultHolder = (settingsForm.groomShortName && settingsForm.brideShortName)
      ? `${settingsForm.groomShortName} & ${settingsForm.brideShortName}`
      : (settingsForm.groomFullName || '');

    setSettingsForm(prev => ({
      ...prev,
      bankAccounts: [
        ...prev.bankAccounts,
        {
          bank: 'BCA',
          accountNumber: '',
          accountName: defaultHolder,
          badgeColor: '#0060AF'
        }
      ]
    }));
    showToast('Rekening baru ditambahkan. Silakan lengkapi detail rekening!');
  };

  const handleRemoveBankAccount = (indexToRemove) => {
    const target = settingsForm.bankAccounts[indexToRemove];
    const bankLabel = target?.bank || `Rekening #${indexToRemove + 1}`;
    if (window.confirm(`Hapus ${bankLabel} dari daftar amplop digital?`)) {
      setSettingsForm(prev => ({
        ...prev,
        bankAccounts: prev.bankAccounts.filter((_, idx) => idx !== indexToRemove)
      }));
      showToast(`${bankLabel} dihapus. Jangan lupa klik "Simpan Pengaturan".`);
    }
  };

  const handleBankAccountChange = (index, field, value) => {
    setSettingsForm(prev => {
      const updated = [...prev.bankAccounts];
      updated[index] = { ...updated[index], [field]: value };

      if (field === 'bank') {
        const lower = value.toLowerCase();
        if (lower.includes('bca')) updated[index].badgeColor = '#0060AF';
        else if (lower.includes('mandiri')) updated[index].badgeColor = '#003d79';
        else if (lower.includes('bsi') || lower.includes('syariah')) updated[index].badgeColor = '#00A39D';
        else if (lower.includes('bri')) updated[index].badgeColor = '#00529C';
        else if (lower.includes('bni')) updated[index].badgeColor = '#F15A24';
        else if (lower.includes('cimb')) updated[index].badgeColor = '#ED1C24';
        else if (lower.includes('jago')) updated[index].badgeColor = '#F58220';
        else if (lower.includes('seabank')) updated[index].badgeColor = '#FF5722';
        else if (lower.includes('dana')) updated[index].badgeColor = '#118EEA';
        else if (lower.includes('ovo')) updated[index].badgeColor = '#4C2A86';
        else if (lower.includes('gopay')) updated[index].badgeColor = '#00AED6';
        else if (lower.includes('shopee')) updated[index].badgeColor = '#EE4D2D';
      }

      return { ...prev, bankAccounts: updated };
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');

    try {
      const res = await fetch(getApiUrl('/api/admin/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: usernameInput.trim(),
          password: passwordInput
        })
      });
      const data = await res.json();
      if (data.success && data.token) {
        setIsAuthenticated(true);
        setAdminToken(data.token);
        localStorage.setItem('wedding_admin_auth', 'true');
        setPasswordInput('');
        showToast('Login berhasil! Selamat datang di Dashboard.');
      } else {
        setLoginError(data.message || 'Username atau Password salah!');
      }
    } catch (err) {
      setLoginError(err.message || 'Gagal menghubungi server. Pastikan backend aktif.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const token = getAdminToken();
      if (token) {
        await fetch(getApiUrl('/api/admin/logout'), {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }
    } catch {}
    setIsAuthenticated(false);
    setAdminToken('');
    localStorage.removeItem('wedding_admin_auth');
    setPasswordInput('');
    setLoginError('');
  };

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [resStats, resWishes, resGuests] = await Promise.all([
        adminFetch('/api/stats').then((r) => r.json()),
        fetch(getApiUrl('/api/wishes')).then((r) => r.json()),
        adminFetch('/api/guests').then((r) => r.json())
      ]);

      const deletedWishIds = getDeletedWishIds();
      const deletedGuestIds = getDeletedGuestIds();

      if (resStats.success) setStats(resStats.data);
      if (resWishes.success) {
        setWishes((resWishes.data || []).filter((w) => !deletedWishIds.includes(String(w.id))));
      }
      if (resGuests.success) {
        const customGuests = getCustomGuests();
        const mergedGuests = [...(resGuests.data || [])];
        customGuests.forEach((cg) => {
          if (!mergedGuests.some((g) => String(g.id) === String(cg.id))) {
            mergedGuests.push(cg);
          }
        });
        setGuests(mergedGuests.filter((g) => !deletedGuestIds.includes(String(g.id))));
      }
    } catch (err) {
      console.warn('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      loadAllData();
    }
  }, [isOpen, isAuthenticated]);

  useEffect(() => {
    if (invitationData) {
      const groom = invitationData.couple?.groom || {};
      const bride = invitationData.couple?.bride || {};
      const quote = invitationData.quote || {};
      const akad = invitationData.events?.akad || {};
      const resepsi = invitationData.events?.resepsi || {};
      const rawAccounts = invitationData.gifts?.accounts;

      setSettingsForm({
        quoteArabic: quote.arabic || "وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً",
        quoteTranslation: quote.translation || "Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang.",
        quoteSource: quote.source || "QS. Ar-Rum: 21",
        groomFullName: groom.fullName || '',
        groomShortName: groom.shortName || '',
        groomOrderNumber: groom.orderNumber || 'Putra pertama dari',
        groomFather: groom.father || '',
        groomMother: groom.mother || '',
        brideFullName: bride.fullName || '',
        brideShortName: bride.shortName || '',
        brideOrderNumber: bride.orderNumber || 'Putri kedua dari',
        brideFather: bride.father || '',
        brideMother: bride.mother || '',
        countdownTitle: invitationData.events?.countdownTitle || 'Menghitung Hari Bahagia',
        countdownTarget: invitationData.countdownTarget || '2026-10-29 09:00:00',
        akadDate: akad.dateFormatted || '',
        akadTime: akad.time || '',
        akadVenue: akad.venue || '',
        akadAddress: akad.address || '',
        akadMapsUrl: akad.mapsUrl || '',
        resepsiTitle: (!resepsi.title || resepsi.title === 'Resepsi Pernikahan' || resepsi.title === 'Resepsi') ? 'Resepsi Makan Siang' : resepsi.title,
        resepsiDate: resepsi.dateFormatted || '',
        resepsiTime: resepsi.time || '',
        resepsiVenue: resepsi.venue || '',
        resepsiAddress: resepsi.address || '',
        resepsiMapsUrl: resepsi.mapsUrl || '',
        mapsEmbedUrl: invitationData.events?.mapsEmbedUrl || invitationData.events?.resepsi?.mapsEmbedUrl || '',
        bankAccounts: Array.isArray(rawAccounts)
          ? rawAccounts.map(a => ({
              bank: a.bank || 'BCA',
              accountNumber: a.accountNumber || '',
              accountName: a.accountName || '',
              badgeColor: a.badgeColor || '#0060AF'
            }))
          : [],
        physicalAddress: invitationData.gifts?.physicalGift?.address || '',
        audioUrl: (invitationData.audio?.url && !invitationData.audio.url.includes('mixkit.co'))
          ? invitationData.audio.url
          : '/audio/wedding-song.mp3'
      });
    }
  }, [invitationData]);

  const getDefaultTemplate = () => {
    const groom = invitationData?.couple?.groom?.shortName || 'Fajar';
    const bride = invitationData?.couple?.bride?.shortName || 'Rosa';
    const resepsiDate = invitationData?.events?.resepsi?.dateFormatted || 'Kamis, 29 Oktober 2026';
    const resepsiVenue = invitationData?.events?.resepsi?.venue || 'Grand Asahlan, Halmahera Selatan';

    return `Kepada Yth. Bapak/Ibu/Saudara/i:
*{name}*

Assalamu'alaikum Warahmatullahi Wabarakatuh

Tanpa mengurangi rasa hormat, perkenankan kami mengundang Bapak/Ibu/Saudara/i untuk menghadiri hari bahagia pernikahan kami:

*${groom} & ${bride}*

📅 *${resepsiDate}*
📍 *${resepsiVenue}*

Untuk melihat detail rangkaian acara, peta lokasi, buku tamu, dan doa restu, silakan klik tautan undangan digital kami berikut:
{link}

Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir serta memberikan doa restu kepada kami.

Wassalamu'alaikum Warahmatullahi Wabarakatuh.
Salam hangat kami,
*${groom} & ${bride}*`;
  };

  // Compile template for display, copying, or WhatsApp dispatch
  const compileWaMessage = (template, targetName = guestNameInput) => {
    const name = (targetName || '').trim() || '[Nama Tamu]';
    const baseUrl = window.location.origin + window.location.pathname;
    const inviteLink = `${baseUrl}?to=${encodeURIComponent(name)}`;
    
    let base = template || getDefaultTemplate();
    return base
      .replace(/\{name\}|\{nama\}/gi, name)
      .replace(/\{link\}|\{tautan\}/gi, inviteLink);
  };

  // Initialize or synchronize waTemplate from invitationData or localStorage
  useEffect(() => {
    if (invitationData?.whatsappTemplate && !isTemplateDirty) {
      setWaTemplate(invitationData.whatsappTemplate);
    } else if (!waTemplate && !isTemplateDirty) {
      const local = localStorage.getItem('wedding_wa_template');
      setWaTemplate(local || getDefaultTemplate());
    }
  }, [invitationData]);

  // Insert variable tag into template
  const insertVariable = (variable) => {
    setWaTemplate(prev => {
      const current = prev || getDefaultTemplate();
      const needsSpace = current.length > 0 && !current.endsWith(' ') && !current.endsWith('\n');
      return current + (needsSpace ? ' ' : '') + variable;
    });
    setIsTemplateDirty(true);
    showToast(`Variabel ${variable} berhasil disisipkan ke template!`);
  };

  // Save customized WhatsApp template to database and localStorage
  const handleSaveTemplate = async () => {
    setIsSavingTemplate(true);
    try {
      const templateToSave = waTemplate || getDefaultTemplate();
      const res = await adminFetch('/api/invitation', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ whatsappTemplate: templateToSave })
      });
      const json = await res.json();
      if (json.success) {
        localStorage.setItem('wedding_wa_template', templateToSave);
        setIsTemplateDirty(false);
        showToast('Format pesan WhatsApp berhasil disimpan secara permanen!');
        if (onUpdateInvitation) {
          onUpdateInvitation(json.data);
        }
      } else {
        showToast(json.message || 'Gagal menyimpan template WhatsApp');
      }
    } catch (err) {
      showToast(err.message || 'Gagal menyimpan template');
    } finally {
      setIsSavingTemplate(false);
    }
  };

  const handleResetTemplate = () => {
    if (!window.confirm('Kembalikan format pesan ke template default awal?')) return;
    const def = getDefaultTemplate();
    setWaTemplate(def);
    setIsTemplateDirty(true);
    showToast('Format pesan dikembalikan ke default. Klik "Simpan Format Pesan" untuk menyimpan permanen.');
  };

  const handleCopyWa = () => {
    const textToCopy = compileWaMessage(waTemplate, guestNameInput);
    navigator.clipboard.writeText(textToCopy);
    setIsCopiedWa(true);
    showToast('Pesan WhatsApp & Tautan Undangan berhasil disalin!');
    setTimeout(() => setIsCopiedWa(false), 2500);
  };

  const handleSendWa = (phoneTarget = null, guestNameTarget = null, guestId = null) => {
    const targetName = guestNameTarget || guestNameInput || '[Nama Tamu]';
    let phone = (phoneTarget || guestPhoneInput).replace(/[^0-9]/g, '');
    if (phone.startsWith('0')) {
      phone = '62' + phone.substring(1);
    }
    
    if (guestId) {
      markGuestAsSent(guestId);
    }

    const textToSend = compileWaMessage(waTemplate, targetName);

    const url = phone
      ? `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(textToSend)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(textToSend)}`;
    window.open(url, '_blank');
  };

  const handleAddGuest = async (e) => {
    e.preventDefault();
    if (!guestNameInput.trim()) {
      showToast('Nama tamu tidak boleh kosong');
      return;
    }

    try {
      const res = await adminFetch('/api/guests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: guestNameInput.trim(),
          phone: guestPhoneInput.trim(),
          group: guestGroupInput
        })
      });
      const json = await res.json();
      if (json.success) {
        saveCustomGuest(json.data);
        setGuests((prev) => [...prev, json.data]);
        showToast(`Tamu "${guestNameInput}" berhasil ditambahkan ke daftar!`);
        setGuestNameInput('');
        setGuestPhoneInput('');
        loadAllData();
      } else {
        showToast(json.message || 'Gagal menambahkan tamu');
      }
    } catch (err) {
      showToast(err.message || 'Gagal menambahkan tamu');
    }
  };

  const handleDeleteGuest = async (id) => {
    const guest = guests.find((g) => String(g.id) === String(id));
    const confirmMsg = guest
      ? `Hapus tamu "${guest.name}" dari daftar undangan?\n(Ucapan doa dari tamu ini juga akan otomatis ikut dibersihkan)`
      : 'Hapus tamu ini dari daftar undangan?';
    if (!window.confirm(confirmMsg)) return;

    try {
      addDeletedGuestId(id);
      removeCustomGuest(id);
      if (guest && guest.name) {
        const cleanName = guest.name.trim().toLowerCase();
        const matchingWishes = wishes.filter(
          (w) => (w.name || '').trim().toLowerCase() === cleanName
        );
        matchingWishes.forEach((w) => addDeletedWishId(w.id));
        setWishes((prev) =>
          prev.filter((w) => (w.name || '').trim().toLowerCase() !== cleanName)
        );
      }

      setGuests((prev) => prev.filter((g) => String(g.id) !== String(id)));
      showToast('Tamu dan ucapannya berhasil dihapus');
      await adminFetch(`/api/guests/${id}`, { method: 'DELETE' });
      loadAllData();
    } catch (err) {
      showToast(err.message || 'Gagal menghapus tamu');
    }
  };

  const handleDeleteWish = async (id) => {
    if (!window.confirm('Yakin ingin menghapus ucapan ini?')) return;
    try {
      addDeletedWishId(id);
      setWishes((prev) => prev.filter((w) => String(w.id) !== String(id)));
      showToast('Ucapan berhasil dihapus');
      await adminFetch(`/api/wishes/${id}`, { method: 'DELETE' });
      loadAllData();
    } catch (err) {
      showToast(err.message || 'Gagal menghapus ucapan');
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      const updates = {
        title: `The Wedding of ${settingsForm.groomShortName || 'Fajar'} & ${settingsForm.brideShortName || 'Rosa'}`,
        quote: {
          arabic: settingsForm.quoteArabic,
          translation: settingsForm.quoteTranslation,
          source: settingsForm.quoteSource
        },
        couple: {
          groom: {
            ...invitationData?.couple?.groom,
            fullName: settingsForm.groomFullName,
            shortName: settingsForm.groomShortName,
            orderNumber: settingsForm.groomOrderNumber,
            father: settingsForm.groomFather,
            mother: settingsForm.groomMother,
            instagram: ''
          },
          bride: {
            ...invitationData?.couple?.bride,
            fullName: settingsForm.brideFullName,
            shortName: settingsForm.brideShortName,
            orderNumber: settingsForm.brideOrderNumber,
            father: settingsForm.brideFather,
            mother: settingsForm.brideMother,
            instagram: ''
          }
        },
        countdownTarget: settingsForm.countdownTarget,
        events: {
          ...invitationData?.events,
          countdownTitle: settingsForm.countdownTitle,
          mapsEmbedUrl: settingsForm.mapsEmbedUrl,
          akad: {
            ...invitationData?.events?.akad,
            dateFormatted: settingsForm.akadDate,
            time: settingsForm.akadTime,
            venue: settingsForm.akadVenue,
            address: settingsForm.akadAddress,
            mapsUrl: settingsForm.akadMapsUrl
          },
          resepsi: {
            ...invitationData?.events?.resepsi,
            title: settingsForm.resepsiTitle || 'Resepsi Makan Siang',
            dateFormatted: settingsForm.resepsiDate,
            time: settingsForm.resepsiTime,
            venue: settingsForm.resepsiVenue,
            address: settingsForm.resepsiAddress,
            mapsUrl: settingsForm.resepsiMapsUrl
          }
        },
        gifts: {
          ...invitationData?.gifts,
          accounts: settingsForm.bankAccounts
        },
        audio: {
          url: settingsForm.audioUrl || invitationData?.audio?.url,
          title: "Romantic Wedding Melody"
        }
      };

      const res = await adminFetch('/api/invitation', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const json = await res.json();
      if (json.success) {
        showToast('Semua pengaturan berhasil disimpan ke database!');
        if (onUpdateInvitation) onUpdateInvitation(json.data);
      } else {
        showToast(json.message || 'Gagal menyimpan pengaturan');
      }
    } catch (err) {
      showToast(err.message || 'Gagal menyimpan pengaturan');
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Calculations for Stats
  const hadirCount = wishes.filter(w => w.attendance === 'hadir').length;
  const tidakHadirCount = wishes.filter(w => w.attendance === 'tidak_hadir').length;
  const raguCount = wishes.filter(w => w.attendance === 'ragu').length;
  const totalPortions = wishes
    .filter(w => w.attendance === 'hadir')
    .reduce((sum, w) => sum + (parseInt(w.guestsCount) || 1), 0);

  // Filtered lists
  const filteredGuests = guests.filter((g) => {
    if (!guestSearchQuery.trim()) return true;
    const q = guestSearchQuery.toLowerCase();
    return (
      (g.name && g.name.toLowerCase().includes(q)) ||
      (g.group && g.group.toLowerCase().includes(q)) ||
      (g.phone && g.phone.includes(q))
    );
  });

  const filteredWishes = wishes.filter((w) => {
    if (wishFilterAttendance !== 'all' && w.attendance !== wishFilterAttendance) {
      return false;
    }
    if (wishSearchQuery.trim()) {
      const q = wishSearchQuery.toLowerCase();
      const matchName = w.name && w.name.toLowerCase().includes(q);
      const matchMsg = w.message && w.message.toLowerCase().includes(q);
      return matchName || matchMsg;
    }
    return true;
  });

  if (!isOpen) return null;

  return (
    <div className="admin-modal-backdrop" onClick={onClose}>
      <div className="admin-modal-window" onClick={(e) => e.stopPropagation()}>
        
        {/* Header Bar */}
        <div className="admin-modal-header">
          <div className="admin-header-left">
            <div className="header-icon-badge">
              <ShieldCheck size={20} className="header-shield-icon" />
            </div>
            <div>
              <div className="header-title-row">
                <h3 className="admin-title font-serif">Dashboard Admin Pengantin</h3>
              </div>
              <p className="admin-subtitle">The Wedding of Fajar & Rosa • Panel Manajemen Undangan</p>
            </div>
          </div>

          <div className="admin-header-actions">
            {isAuthenticated && (
              <button onClick={loadAllData} className="header-action-btn" title="Muat Ulang Data">
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                <span className="hide-mobile">Segarkan</span>
              </button>
            )}
            {isAuthenticated && (
              <button onClick={handleLogout} className="header-action-btn logout" title="Kunci Dashboard">
                <Lock size={14} />
                <span>Kunci</span>
              </button>
            )}
            <button className="admin-close-btn" onClick={onClose} title="Tutup Modal">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Toast Notification */}
        {toast && (
          <div className="admin-toast animate-fade-in">
            <CheckCircle size={16} />
            <span>{toast}</span>
          </div>
        )}

        {/* Login Screen if not authenticated */}
        {!isAuthenticated ? (
          <div className="admin-login-screen">
            <div className="pin-box text-center">
              <div className="pin-icon-wrap">
                <Lock size={30} className="admin-icon-blue" />
              </div>
              <h4 className="font-serif pin-title">Portal Akses Pengantin</h4>
              <p className="pin-desc">Silakan masukkan username dan password admin untuk mengelola buku tamu, kehadiran, dan konfigurasi acara.</p>
              
              <form onSubmit={handleLogin} className="pin-form">
                <div className="admin-login-fields">
                  <div className="login-field-box">
                    <label className="login-field-lbl">Username</label>
                    <input
                      type="text"
                      placeholder="Username admin"
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value)}
                      className="admin-input login-input-field"
                      required
                      autoComplete="username"
                    />
                  </div>
                  <div className="login-field-box">
                    <label className="login-field-lbl">Password / PIN</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      className="admin-input login-input-field"
                      required
                      autoFocus
                      autoComplete="current-password"
                    />
                  </div>
                </div>

                {loginError && (
                  <div className="pin-error-box">
                    <AlertCircle size={15} />
                    <span>{loginError}</span>
                  </div>
                )}
                
                <button type="submit" disabled={loginLoading} className="btn-gold pin-submit-btn">
                  <Unlock size={16} />
                  <span>{loginLoading ? 'Memeriksa Kredensial...' : 'Masuk ke Dashboard'}</span>
                </button>
              </form>
              
              <div className="pin-hint-card">
                <ShieldCheck size={16} className="admin-icon-blue" />
                <span>Sesi aman terenkripsi. Hanya diperuntukkan bagi mempelai & panitia resmi.</span>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Navigasi Tab Segmented */}
            <div className="admin-tabs-bar">
              <button
                className={`admin-tab-item ${activeTab === 'stats' ? 'active' : ''}`}
                onClick={() => setActiveTab('stats')}
              >
                <Users size={16} />
                <span>Ringkasan</span>
              </button>
              
              <button
                className={`admin-tab-item ${activeTab === 'generator' ? 'active' : ''}`}
                onClick={() => setActiveTab('generator')}
              >
                <Share2 size={16} />
                <span>Tamu & WhatsApp</span>
                <span className="tab-pill-count">{guests.length}</span>
              </button>

              <button
                className={`admin-tab-item ${activeTab === 'wishes' ? 'active' : ''}`}
                onClick={() => setActiveTab('wishes')}
              >
                <MessageSquare size={16} />
                <span>Buku Tamu</span>
                <span className="tab-pill-count">{wishes.length}</span>
              </button>

              <button
                className={`admin-tab-item ${activeTab === 'settings' ? 'active' : ''}`}
                onClick={() => setActiveTab('settings')}
              >
                <Settings size={16} />
                <span>Edit Undangan</span>
              </button>
            </div>

            {/* TAB 1: RINGKASAN KEHADIRAN (STATS & OVERVIEW) */}
            {activeTab === 'stats' && (
              <div className="admin-tab-content">
                
                {/* 4 Cards Metrics Grid */}
                <div className="stats-metric-grid">
                  <div className="metric-card blue">
                    <div className="metric-header">
                      <span className="metric-lbl">Total Ucapan Masuk</span>
                      <div className="metric-icon-wrap blue">
                        <MessageSquare size={18} />
                      </div>
                    </div>
                    <div className="metric-val">{wishes.length}</div>
                    <p className="metric-sub">Doa restu tersimpan di database</p>
                  </div>

                  <div className="metric-card emerald">
                    <div className="metric-header">
                      <span className="metric-lbl">Konfirmasi Hadir</span>
                      <div className="metric-icon-wrap emerald">
                        <CheckCircle size={18} />
                      </div>
                    </div>
                    <div className="metric-val">{stats?.hadirCount || hadirCount}</div>
                    <p className="metric-sub">
                      Estimasi Katering: <strong>{stats?.totalGuestsCount || totalPortions} Porsi</strong>
                    </p>
                  </div>

                  <div className="metric-card sky">
                    <div className="metric-header">
                      <span className="metric-lbl">Tamu Terdaftar</span>
                      <div className="metric-icon-wrap sky">
                        <Users size={18} />
                      </div>
                    </div>
                    <div className="metric-val">{guests.length}</div>
                    <p className="metric-sub">Dalam daftar generator WhatsApp</p>
                  </div>

                  <div className="metric-card rose">
                    <div className="metric-header">
                      <span className="metric-lbl">Berhalangan Hadir</span>
                      <div className="metric-icon-wrap rose">
                        <XCircle size={18} />
                      </div>
                    </div>
                    <div className="metric-val">{stats?.tidakHadirCount || tidakHadirCount}</div>
                    <p className="metric-sub">
                      Ragu-ragu: <strong>{raguCount} Tamu</strong>
                    </p>
                  </div>
                </div>

                {/* Event Location & Maps Quick Navigation Box */}
                <div className="content-card">
                  <div className="card-header-row">
                    <div className="card-header-left">
                      <div className="card-icon-wrap">
                        <MapPin size={18} className="admin-icon-blue" />
                      </div>
                      <div>
                        <h4 className="card-headline font-serif">Lokasi & Navigasi Peta Acara</h4>
                        <p className="card-subhead">Akses cepat alamat dan rute navigasi Google Maps untuk tamu undangan</p>
                      </div>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => setActiveTab('settings')} 
                      className="btn-text-link"
                    >
                      <span>Ubah di Pengaturan</span>
                      <ExternalLink size={12} />
                    </button>
                  </div>

                  <div className="location-cards-grid">
                    <div className="location-item-card">
                      <div className="loc-badge-tag akad">
                        <Calendar size={12} />
                        <span>Akad Nikah</span>
                      </div>
                      <h5 className="loc-title">{invitationData?.events?.akad?.venue || "Grand Asahlan"}</h5>
                      <p className="loc-text">{invitationData?.events?.akad?.address || "Jl Tomori, Kec. Bacan, Kabupaten Halmahera Selatan, Maluku Utara"}</p>
                      <div className="loc-time-badge">
                        <Clock size={12} />
                        <span>{invitationData?.events?.akad?.time || "09:00 WIT"}</span>
                      </div>
                    </div>

                    <div className="location-item-card">
                      <div className="loc-badge-tag resepsi">
                        <Calendar size={12} />
                        <span>{invitationData?.events?.resepsi?.title === 'Resepsi Pernikahan' ? 'Resepsi Makan Siang' : (invitationData?.events?.resepsi?.title || 'Resepsi Makan Siang')}</span>
                      </div>
                      <h5 className="loc-title">{invitationData?.events?.resepsi?.venue || "Grand Asahlan"}</h5>
                      <p className="loc-text">{invitationData?.events?.resepsi?.address || "Jl. Tomori, Kec. Bacan, Kabupaten Halmahera Selatan, Maluku Utara"}</p>
                      <div className="loc-time-badge">
                        <Clock size={12} />
                        <span>{invitationData?.events?.resepsi?.time || "12:00 WIT"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Export Laporan CSV Banner */}
                <div className="export-banner-card">
                  <div className="export-info">
                    <div className="export-icon-box">
                      <Download size={22} className="admin-icon-blue" />
                    </div>
                    <div>
                      <h4 className="font-serif export-title">Ekspor Laporan Kehadiran & Katering</h4>
                      <p className="export-desc">
                        Unduh rekapitulasi data nama tamu, konfirmasi kehadiran, jumlah porsi piring, dan pesan doa ke format spreadsheet Excel (.CSV).
                      </p>
                    </div>
                  </div>
                  <a
                    href={getApiUrl('/api/export/csv')}
                    download="data-rsvp-pernikahan-fajar-rosa.csv"
                    className="btn-gold export-action-btn"
                  >
                    <Download size={16} />
                    <span>Download Excel (CSV)</span>
                  </a>
                </div>

              </div>
            )}

            {/* TAB 2: TAMU & GENERATOR WHATSAPP */}
            {activeTab === 'generator' && (
              <div className="admin-tab-content">
                
                {/* Bagian Atas: Generator Pesan & Preview */}
                <div className="content-card">
                  <div className="card-header-row">
                    <div className="card-header-left">
                      <div className="card-icon-wrap">
                        <Share2 size={18} className="admin-icon-blue" />
                      </div>
                      <div>
                        <h4 className="card-headline font-serif">Generator Pesan WhatsApp & Tautan Personal</h4>
                        <p className="card-subhead">Buat pesan undangan resmi yang personal dengan tautan nama tamu otomatis</p>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleAddGuest} className="generator-two-col">
                    {/* Kolom Kiri: Input Data Tamu */}
                    <div className="gen-col-inputs">
                      <div className="form-field-group">
                        <label className="field-label">Nama Tamu Undangan *</label>
                        <input
                          type="text"
                          placeholder="Contoh: Bapak Ir. Bambang & Keluarga"
                          value={guestNameInput}
                          onChange={(e) => setGuestNameInput(e.target.value)}
                          className="admin-input modern-input"
                          required
                        />
                      </div>

                      <div className="form-field-group" style={{ marginBottom: '1rem' }}>
                        <label className="field-label">Nomor WhatsApp (Opsional)</label>
                        <div className="input-with-prefix">
                          <input
                            type="text"
                            placeholder="081234567890"
                            value={guestPhoneInput}
                            onChange={(e) => setGuestPhoneInput(e.target.value)}
                            className="admin-input modern-input"
                          />
                        </div>
                      </div>

                      <div className="gen-btn-group">
                        <button type="submit" className="btn-gold save-guest-btn">
                          <Plus size={16} />
                          <span>Simpan ke Daftar Tamu</span>
                        </button>
                        <button type="button" onClick={() => handleSendWa()} className="btn-wa-direct">
                          <Send size={15} />
                          <span>Kirim ke WhatsApp Langsung</span>
                        </button>
                      </div>
                    </div>

                    {/* Kolom Kanan: Editor Format Pesan WhatsApp & Simpan Template */}
                    <div className="gen-col-preview">
                      {/* Header Toolbar */}
                      <div className="wa-editor-header">
                        <div className="wa-editor-title-wrap">
                          <div className="wa-badge-icon">
                            <MessageSquare size={16} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div className="wa-editor-heading-row">
                              <h5 className="wa-editor-title">Format Pesan WhatsApp</h5>
                              <span className={`wa-status-pill ${isTemplateDirty ? 'dirty' : 'saved'}`}>
                                {isTemplateDirty ? (
                                  <>
                                    <span className="status-dot orange" />
                                    <span>Belum Disimpan</span>
                                  </>
                                ) : (
                                  <>
                                    <Check size={11} className="text-emerald" />
                                    <span>Template Tersimpan</span>
                                  </>
                                )}
                              </span>
                            </div>
                            <p className="wa-editor-sub">
                              Dapat diedit bebas sesuai kebutuhan. Format ini otomatis digunakan untuk semua tamu.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Variable Quick-Insert Chips */}
                      <div className="wa-variable-chips-row">
                        <span className="chips-label">Sisipkan:</span>
                        <button
                          type="button"
                          onClick={() => insertVariable('{name}')}
                          className="var-chip"
                          title="Klik untuk menyisipkan variabel {name} (Otomatis diganti nama tamu)"
                        >
                          <Plus size={11} />
                          <span className="var-chip-code">{'{name}'}</span>
                          <span className="var-chip-desc">Nama Tamu</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => insertVariable('{link}')}
                          className="var-chip"
                          title="Klik untuk menyisipkan variabel {link} (Tautan personal tamu)"
                        >
                          <Plus size={11} />
                          <span className="var-chip-code">{'{link}'}</span>
                          <span className="var-chip-desc">Link Undangan</span>
                        </button>
                      </div>

                      {/* Textarea Editor Box */}
                      <div className="wa-editor-box">
                        <textarea
                          value={waTemplate || getDefaultTemplate()}
                          onChange={(e) => {
                            setWaTemplate(e.target.value);
                            setIsTemplateDirty(true);
                          }}
                          rows={12}
                          className="wa-editor-textarea"
                          placeholder="Ketik atau edit isi format undangan WhatsApp di sini..."
                          title="Ubah teks undangan kapan saja"
                        />
                      </div>

                      {/* Recipient & URL Info Strip */}
                      <div className="wa-preview-info-strip">
                        <div className="preview-info-header">
                          <span className="preview-info-label">Penerima Saat Ini:</span>
                          <strong className="preview-info-name">
                            {guestNameInput.trim() || '[Nama Tamu]'}
                          </strong>
                        </div>
                        <div className="preview-info-link-row">
                          <span className="preview-info-link-label">Parameter Tautan:</span>
                          <span className="preview-info-slug">
                            ?to={encodeURIComponent(guestNameInput.trim() || '[Nama Tamu]')}
                          </span>
                        </div>
                      </div>

                      {/* Action Bar: Simpan, Reset, Salin */}
                      <div className="wa-editor-action-bar">
                        <div className="action-bar-left">
                          <button
                            type="button"
                            onClick={handleSaveTemplate}
                            disabled={isSavingTemplate || !isTemplateDirty}
                            className={`btn-save-template ${!isTemplateDirty ? 'is-saved' : ''}`}
                            title={!isTemplateDirty ? 'Template sudah tersimpan' : 'Simpan perubahan template ke database'}
                          >
                            <Save size={14} />
                            <span>
                              {isSavingTemplate 
                                ? 'Menyimpan...' 
                                : !isTemplateDirty 
                                  ? 'Template Tersimpan' 
                                  : 'Simpan Template'}
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={handleResetTemplate}
                            className="btn-reset-template"
                            title="Kembalikan ke template default bawaan"
                          >
                            <RotateCcw size={13} />
                            <span>Reset Default</span>
                          </button>
                        </div>

                        <div className="action-bar-right">
                          <button 
                            type="button" 
                            onClick={handleCopyWa} 
                            className={`btn-copy-wa ${isCopiedWa ? 'copied' : ''}`}
                            title="Salin pesan siap kirim untuk tamu saat ini"
                          >
                            {isCopiedWa ? <Check size={14} /> : <Copy size={14} />}
                            <span>{isCopiedWa ? 'Tersalin!' : 'Salin Pesan'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>

                {/* Bagian Bawah: Daftar Tamu Tersimpan */}
                <div className="content-card" style={{ marginTop: '1.4rem' }}>
                  <div className="card-header-row">
                    <div className="card-header-left">
                      <div className="card-icon-wrap">
                        <UserCheck size={18} className="admin-icon-blue" />
                      </div>
                      <div>
                        <h4 className="card-headline font-serif">
                          Daftar Tamu Tersimpan ({guests.length})
                          {guests.length > 0 && (
                            <span className="sent-summary-badge">
                              ✓ Terkirim: {guests.filter(g => sentGuestIds.includes(String(g.id))).length} / {guests.length}
                            </span>
                          )}
                        </h4>
                        <p className="card-subhead">Daftar tamu yang telah dibuatkan tautan personal</p>
                      </div>
                    </div>

                    {/* Search Bar */}
                    <div className="table-search-box">
                      <Search size={14} className="search-icon" />
                      <input
                        type="text"
                        placeholder="Cari nama atau nomor HP..."
                        value={guestSearchQuery}
                        onChange={(e) => setGuestSearchQuery(e.target.value)}
                        className="table-search-input"
                      />
                      {guestSearchQuery && (
                        <button onClick={() => setGuestSearchQuery('')} className="clear-search-btn">
                          <X size={13} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="table-container">
                    <table className="admin-modern-table">
                      <thead>
                        <tr>
                          <th>Nama Tamu</th>
                          <th>No. WhatsApp</th>
                          <th>Status WA</th>
                          <th className="text-right">Aksi Cepat</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredGuests.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="table-empty-cell">
                              {guests.length === 0 
                                ? 'Belum ada tamu yang disimpan. Masukkan nama tamu pada form di atas.'
                                : 'Tidak ditemukan tamu yang cocok dengan pencarian.'}
                            </td>
                          </tr>
                        ) : (
                          filteredGuests.map((g) => (
                            <tr key={g.id}>
                              <td>
                                <div className="guest-name-cell">
                                  <div className="guest-initial-avatar">
                                    {g.name.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <strong className="guest-name-text">{g.name}</strong>
                                    <span className="guest-slug">?to={encodeURIComponent(g.name)}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="phone-cell">
                                {g.phone ? (
                                  <span className="phone-badge">{g.phone}</span>
                                ) : (
                                  <span className="text-muted-dash">-</span>
                                )}
                              </td>
                              <td>
                                <button
                                  type="button"
                                  onClick={() => toggleGuestSent(g.id)}
                                  className={`guest-sent-status-pill ${sentGuestIds.includes(String(g.id)) ? 'sent' : 'unsent'}`}
                                  title={sentGuestIds.includes(String(g.id)) ? 'Status: Terkirim. Klik untuk ubah ke Belum' : 'Status: Belum Kirim. Klik untuk tandai Terkirim'}
                                >
                                  {sentGuestIds.includes(String(g.id)) ? (
                                    <>
                                      <CheckCircle size={12} />
                                      <span>Terkirim</span>
                                    </>
                                  ) : (
                                    <>
                                      <Clock size={12} />
                                      <span>Belum Kirim</span>
                                    </>
                                  )}
                                </button>
                              </td>
                              <td className="text-right">
                                <div className="table-actions-row">
                                  <button
                                    onClick={() => handleSendWa(g.phone, g.name, g.id)}
                                    className="btn-action-wa"
                                    title="Kirim via WhatsApp"
                                  >
                                    <Send size={12} />
                                    <span>Kirim WA</span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      const url = `${window.location.origin}${window.location.pathname}?to=${encodeURIComponent(g.name)}`;
                                      navigator.clipboard.writeText(url);
                                      showToast(`Tautan khusus untuk ${g.name} berhasil disalin!`);
                                    }}
                                    className="btn-action-icon"
                                    title="Salin Tautan Khusus"
                                  >
                                    <Copy size={13} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteGuest(g.id)}
                                    className="btn-action-icon danger"
                                    title="Hapus Tamu"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

            {/* TAB 3: BUKU TAMU & DOA RESTU */}
            {activeTab === 'wishes' && (
              <div className="admin-tab-content">
                
                <div className="content-card">
                  <div className="card-header-row">
                    <div className="card-header-left">
                      <div className="card-icon-wrap">
                        <MessageSquare size={18} className="admin-icon-blue" />
                      </div>
                      <div>
                        <h4 className="card-headline font-serif">Buku Tamu & Konfirmasi Kehadiran ({wishes.length})</h4>
                        <p className="card-subhead">Data ucapan doa restu dan konfirmasi kehadiran langsung dari tamu undangan</p>
                      </div>
                    </div>

                    <a 
                      href={getApiUrl(`/api/export/csv?token=${encodeURIComponent(getAdminToken())}`)} 
                      download="data-buku-tamu.csv" 
                      className="btn-outline-gold btn-sm"
                    >
                      <Download size={13} />
                      <span>Download CSV</span>
                    </a>
                  </div>

                  {/* Filter Toolbar */}
                  <div className="filter-toolbar-row">
                    <div className="filter-chips-group">
                      <button
                        className={`filter-chip ${wishFilterAttendance === 'all' ? 'active' : ''}`}
                        onClick={() => setWishFilterAttendance('all')}
                      >
                        Semua ({wishes.length})
                      </button>
                      <button
                        className={`filter-chip ${wishFilterAttendance === 'hadir' ? 'active hadir' : ''}`}
                        onClick={() => setWishFilterAttendance('hadir')}
                      >
                        <CheckCircle size={12} />
                        Hadir ({hadirCount})
                      </button>
                      <button
                        className={`filter-chip ${wishFilterAttendance === 'tidak_hadir' ? 'active tidak_hadir' : ''}`}
                        onClick={() => setWishFilterAttendance('tidak_hadir')}
                      >
                        <XCircle size={12} />
                        Berhalangan ({tidakHadirCount})
                      </button>
                    </div>

                    <div className="table-search-box">
                      <Search size={14} className="search-icon" />
                      <input
                        type="text"
                        placeholder="Cari pengirim atau kata dalam doa..."
                        value={wishSearchQuery}
                        onChange={(e) => setWishSearchQuery(e.target.value)}
                        className="table-search-input"
                      />
                      {wishSearchQuery && (
                        <button onClick={() => setWishSearchQuery('')} className="clear-search-btn">
                          <X size={13} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Tabel Ucapan */}
                  <div className="table-container">
                    <table className="admin-modern-table">
                      <thead>
                        <tr>
                          <th>Pengirim</th>
                          <th>Status Kehadiran</th>
                          <th>Pesan Doa Restu</th>
                          <th className="text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredWishes.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="table-empty-cell">
                              Tidak ada ucapan doa yang sesuai dengan kriteria filter.
                            </td>
                          </tr>
                        ) : (
                          filteredWishes.map((w) => (
                            <tr key={w.id}>
                              <td>
                                <div className="guest-name-cell">
                                  <div className="wish-avatar-circle">
                                    {w.name.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <strong className="guest-name-text">{w.name}</strong>
                                    <span className="wish-time-text">
                                      {w.createdAt ? new Date(w.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Baru saja'}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <span className={`status-pill ${w.attendance}`}>
                                  {w.attendance === 'hadir' ? (
                                    <>
                                      <CheckCircle size={11} />
                                      <span>Hadir ({w.guestsCount || 1} Porsi)</span>
                                    </>
                                  ) : w.attendance === 'tidak_hadir' ? (
                                    <>
                                      <XCircle size={11} />
                                      <span>Berhalangan</span>
                                    </>
                                  ) : (
                                    <>
                                      <span>Masih Ragu</span>
                                    </>
                                  )}
                                </span>
                              </td>
                              <td className="wish-message-cell">
                                <p className="wish-message-text">"{w.message}"</p>
                              </td>
                              <td className="text-right">
                                <button
                                  onClick={() => handleDeleteWish(w.id)}
                                  className="btn-action-icon danger"
                                  title="Hapus Ucapan"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                </div>

              </div>
            )}

            {/* TAB 4: EDIT PENGATURAN UNDANGAN */}
            {activeTab === 'settings' && (
              <div className="admin-tab-content">
                
                <form onSubmit={handleSaveSettings} className="settings-form-layout">
                  
                  {/* MODUL 0: AYAT SUCI & KUTIPAN PERNIKAHAN */}
                  <div className="content-card">
                    <div className="card-header-row">
                      <div className="card-header-left">
                        <div className="card-icon-wrap">
                          <Quote size={18} className="admin-icon-blue" />
                        </div>
                        <div>
                          <h4 className="card-headline font-serif">Kutipan &amp; Ayat Suci Al-Qur'an</h4>
                          <p className="card-subhead">Teks ayat suci dan terjemahan yang tampil di bagian pembuka undangan</p>
                        </div>
                      </div>
                    </div>

                    <div className="form-field-group">
                      <label className="field-label">Teks Ayat Suci (Bahasa Arab)</label>
                      <textarea
                        rows={2}
                        value={settingsForm.quoteArabic}
                        onChange={(e) => setSettingsForm({ ...settingsForm, quoteArabic: e.target.value })}
                        className="admin-textarea modern-input font-serif"
                        dir="rtl"
                        placeholder="وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا..."
                      />
                    </div>

                    <div className="form-field-group">
                      <label className="field-label">Arti / Terjemahan Ayat</label>
                      <textarea
                        rows={3}
                        value={settingsForm.quoteTranslation}
                        onChange={(e) => setSettingsForm({ ...settingsForm, quoteTranslation: e.target.value })}
                        className="admin-textarea modern-input"
                        placeholder="Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan pasangan-pasangan untukmu..."
                      />
                    </div>

                    <div className="form-field-group">
                      <label className="field-label">Sumber Ayat / Surat</label>
                      <input
                        type="text"
                        value={settingsForm.quoteSource}
                        onChange={(e) => setSettingsForm({ ...settingsForm, quoteSource: e.target.value })}
                        className="admin-input modern-input"
                        placeholder="QS. Ar-Rum: 21"
                      />
                    </div>
                  </div>

                  {/* MODUL 1: DATA MEMPELAI (2 KOLOM RAPI) */}
                  <div className="content-card">
                    <div className="card-header-row">
                      <div className="card-header-left">
                        <div className="card-icon-wrap">
                          <Heart size={18} className="admin-icon-blue" />
                        </div>
                        <div>
                          <h4 className="card-headline font-serif">Data Mempelai (Pengantin)</h4>
                          <p className="card-subhead">Informasi nama lengkap, nama panggilan, urutan anak, dan kedua orang tua pengantin</p>
                        </div>
                      </div>
                    </div>

                    <div className="form-two-col-grid">
                      {/* Kolom Mempelai Pria */}
                      <div className="form-sub-panel">
                        <div className="sub-panel-header groom">
                          <span>Mempelai Pria (Groom)</span>
                        </div>
                        
                        <div className="form-field-group">
                          <label className="field-label">Nama Lengkap & Gelar</label>
                          <input
                            type="text"
                            value={settingsForm.groomFullName}
                            onChange={(e) => setSettingsForm({ ...settingsForm, groomFullName: e.target.value })}
                            className="admin-input modern-input"
                            placeholder="Putra Fajar Widianto, S.Kom."
                          />
                        </div>

                        <div className="form-field-group">
                          <label className="field-label">Nama Panggilan</label>
                          <input
                            type="text"
                            value={settingsForm.groomShortName}
                            onChange={(e) => setSettingsForm({ ...settingsForm, groomShortName: e.target.value })}
                            className="admin-input modern-input"
                            placeholder="Fajar"
                          />
                        </div>

                        <div className="form-field-group">
                          <label className="field-label">Keterangan Urutan Anak</label>
                          <input
                            type="text"
                            value={settingsForm.groomOrderNumber}
                            onChange={(e) => setSettingsForm({ ...settingsForm, groomOrderNumber: e.target.value })}
                            className="admin-input modern-input"
                            placeholder="Putra pertama dari"
                          />
                        </div>

                        <div className="form-fields-row">
                          <div className="form-field-group flex-1">
                            <label className="field-label">Nama Ayah</label>
                            <input
                              type="text"
                              value={settingsForm.groomFather}
                              onChange={(e) => setSettingsForm({ ...settingsForm, groomFather: e.target.value })}
                              className="admin-input modern-input"
                              placeholder="Bpk. Sutarno"
                            />
                          </div>
                          <div className="form-field-group flex-1">
                            <label className="field-label">Nama Ibu</label>
                            <input
                              type="text"
                              value={settingsForm.groomMother}
                              onChange={(e) => setSettingsForm({ ...settingsForm, groomMother: e.target.value })}
                              className="admin-input modern-input"
                              placeholder="Ibu Supini"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Kolom Mempelai Wanita */}
                      <div className="form-sub-panel">
                        <div className="sub-panel-header bride">
                          <span>Mempelai Wanita (Bride)</span>
                        </div>

                        <div className="form-field-group">
                          <label className="field-label">Nama Lengkap & Gelar</label>
                          <input
                            type="text"
                            value={settingsForm.brideFullName}
                            onChange={(e) => setSettingsForm({ ...settingsForm, brideFullName: e.target.value })}
                            className="admin-input modern-input"
                            placeholder="Rosa Prisantika Bay Sukur, S.E."
                          />
                        </div>

                        <div className="form-field-group">
                          <label className="field-label">Nama Panggilan</label>
                          <input
                            type="text"
                            value={settingsForm.brideShortName}
                            onChange={(e) => setSettingsForm({ ...settingsForm, brideShortName: e.target.value })}
                            className="admin-input modern-input"
                            placeholder="Rosa"
                          />
                        </div>

                        <div className="form-field-group">
                          <label className="field-label">Keterangan Urutan Anak</label>
                          <input
                            type="text"
                            value={settingsForm.brideOrderNumber}
                            onChange={(e) => setSettingsForm({ ...settingsForm, brideOrderNumber: e.target.value })}
                            className="admin-input modern-input"
                            placeholder="Putri kedua dari"
                          />
                        </div>

                        <div className="form-fields-row">
                          <div className="form-field-group flex-1">
                            <label className="field-label">Nama Ayah</label>
                            <input
                              type="text"
                              value={settingsForm.brideFather}
                              onChange={(e) => setSettingsForm({ ...settingsForm, brideFather: e.target.value })}
                              className="admin-input modern-input"
                              placeholder="Bpk. Ahmad Erwin Sukur"
                            />
                          </div>
                          <div className="form-field-group flex-1">
                            <label className="field-label">Nama Ibu</label>
                            <input
                              type="text"
                              value={settingsForm.brideMother}
                              onChange={(e) => setSettingsForm({ ...settingsForm, brideMother: e.target.value })}
                              className="admin-input modern-input"
                              placeholder="Ibu Amira"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* MODUL 2: RANGKAIAN ACARA & PETA LOKASI */}
                  <div className="content-card">
                    <div className="card-header-row">
                      <div className="card-header-left">
                        <div className="card-icon-wrap">
                          <MapPin size={18} className="admin-icon-blue" />
                        </div>
                        <div>
                          <h4 className="card-headline font-serif">Rangkaian Acara & Peta Lokasi (Google Maps)</h4>
                          <p className="card-subhead">Kelola tanggal, jam, gedung, alamat lengkap, dan tautan rute navigasi Google Maps</p>
                        </div>
                      </div>
                    </div>

                    {/* Sub-panel 0: Hitung Mundur Hari Bahagia (Live Countdown) */}
                    <div className="form-sub-panel" style={{ marginBottom: '1.2rem', background: 'rgba(6, 20, 50, 0.75)', border: '1px solid rgba(147, 197, 253, 0.35)', borderRadius: '14px', padding: '1.2rem' }}>
                      <div className="sub-panel-header" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.8rem', color: 'var(--gold-300)', fontWeight: '700', fontSize: '0.92rem' }}>
                        <Clock size={15} />
                        <span>Pengaturan Hitung Mundur (Live Countdown)</span>
                      </div>

                      <div className="form-fields-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                        <div className="form-field-group">
                          <label className="field-label">Judul Hitung Mundur</label>
                          <input
                            type="text"
                            value={settingsForm.countdownTitle}
                            onChange={(e) => setSettingsForm({ ...settingsForm, countdownTitle: e.target.value })}
                            className="admin-input modern-input"
                            placeholder="Menghitung Hari Bahagia"
                          />
                        </div>

                        <div className="form-field-group">
                          <label className="field-label">Target Tanggal &amp; Jam Acara (WIT)</label>
                          <input
                            type="datetime-local"
                            value={(settingsForm.countdownTarget || '').slice(0, 16).replace(' ', 'T')}
                            onChange={(e) => setSettingsForm({ ...settingsForm, countdownTarget: e.target.value })}
                            className="admin-input modern-input"
                          />
                          <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                            📅 Klik untuk memilih tanggal &amp; jam dari kalender. Zona waktu otomatis terkunci ke Waktu Indonesia Timur (WIT / GMT+9).
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="form-two-col-grid">
                      {/* Sub-panel 1: Akad Nikah */}
                      <div className="form-sub-panel">
                        <div className="sub-panel-header akad">
                          <Calendar size={13} />
                          <span>1. Akad Nikah</span>
                        </div>

                        <div className="form-fields-row">
                          <div className="form-field-group flex-1">
                            <label className="field-label">Tanggal Akad</label>
                            <input
                              type="text"
                              value={settingsForm.akadDate}
                              onChange={(e) => setSettingsForm({ ...settingsForm, akadDate: e.target.value })}
                              className="admin-input modern-input"
                              placeholder="Sabtu, 28 November 2026"
                            />
                          </div>
                          <div className="form-field-group flex-1">
                            <label className="field-label">Waktu Akad</label>
                            <input
                              type="text"
                              value={settingsForm.akadTime}
                              onChange={(e) => setSettingsForm({ ...settingsForm, akadTime: e.target.value })}
                              className="admin-input modern-input"
                              placeholder="09:00 - 10:00 WIB"
                            />
                          </div>
                        </div>

                        <div className="form-field-group">
                          <label className="field-label">Nama Masjid / Tempat Akad</label>
                          <input
                            type="text"
                            value={settingsForm.akadVenue}
                            onChange={(e) => setSettingsForm({ ...settingsForm, akadVenue: e.target.value })}
                            className="admin-input modern-input"
                            placeholder="Masjid Raya Kemang"
                          />
                        </div>

                        <div className="form-field-group">
                          <label className="field-label">Alamat Lengkap Lokasi Akad</label>
                          <textarea
                            rows={2}
                            value={settingsForm.akadAddress}
                            onChange={(e) => setSettingsForm({ ...settingsForm, akadAddress: e.target.value })}
                            className="admin-textarea modern-input"
                            placeholder="Jl. Kemang Raya No. 10, Mampang Prapatan, Jakarta Selatan"
                          />
                        </div>

                      </div>

                      {/* Sub-panel 2: Resepsi Makan Siang */}
                      <div className="form-sub-panel">
                        <div className="sub-panel-header resepsi">
                          <Calendar size={13} />
                          <span>2. Resepsi Makan Siang</span>
                        </div>

                        <div className="form-field-group">
                          <label className="field-label">Judul Rangkaian Acara Resepsi</label>
                          <input
                            type="text"
                            value={settingsForm.resepsiTitle}
                            onChange={(e) => setSettingsForm({ ...settingsForm, resepsiTitle: e.target.value })}
                            className="admin-input modern-input"
                            placeholder="Resepsi Makan Siang"
                          />
                        </div>

                        <div className="form-fields-row">
                          <div className="form-field-group flex-1">
                            <label className="field-label">Tanggal Resepsi</label>
                            <input
                              type="text"
                              value={settingsForm.resepsiDate}
                              onChange={(e) => setSettingsForm({ ...settingsForm, resepsiDate: e.target.value })}
                              className="admin-input modern-input"
                              placeholder="Kamis, 29 Oktober 2026"
                            />
                          </div>
                          <div className="form-field-group flex-1">
                            <label className="field-label">Waktu Resepsi</label>
                            <input
                              type="text"
                              value={settingsForm.resepsiTime}
                              onChange={(e) => setSettingsForm({ ...settingsForm, resepsiTime: e.target.value })}
                              className="admin-input modern-input"
                              placeholder="12:00 WIT"
                            />
                          </div>
                        </div>

                        <div className="form-field-group">
                          <label className="field-label">Nama Gedung / Ballroom Resepsi</label>
                          <input
                            type="text"
                            value={settingsForm.resepsiVenue}
                            onChange={(e) => setSettingsForm({ ...settingsForm, resepsiVenue: e.target.value })}
                            className="admin-input modern-input"
                            placeholder="Grand Asahlan"
                          />
                        </div>

                        <div className="form-field-group">
                          <label className="field-label">Alamat Lengkap Lokasi Resepsi</label>
                          <textarea
                            rows={2}
                            value={settingsForm.resepsiAddress}
                            onChange={(e) => setSettingsForm({ ...settingsForm, resepsiAddress: e.target.value })}
                            className="admin-textarea modern-input"
                            placeholder="Jl. Tomori, Kec. Bacan, Kabupaten Halmahera Selatan, Maluku Utara"
                          />
                        </div>

                      </div>

                      {/* Sub-panel 3: Peta Interaktif (Google Maps Embed) */}
                      <div className="form-sub-panel">
                        <div className="sub-panel-header">
                          <MapPin size={13} />
                          <span>3. Peta Interaktif Halaman Depan (Google Maps Embed)</span>
                        </div>

                        <div className="form-field-group">
                          <label className="field-label">Sematkan URL / Kode Iframe Google Maps</label>
                          <textarea
                            rows={3}
                            value={settingsForm.mapsEmbedUrl}
                            onChange={(e) => setSettingsForm({ ...settingsForm, mapsEmbedUrl: e.target.value })}
                            className="admin-textarea modern-input font-mono"
                            placeholder="https://maps.google.com/maps?q=...&output=embed atau <iframe src='...'></iframe>"
                          />
                          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.4rem', lineHeight: '1.4' }}>
                            💡 <em>Tips:</em> Anda dapat memasukkan URL embed (<code>output=embed</code>) atau kode <code>&lt;iframe&gt;</code> dari Google Maps (Sematkan peta). Jika dikosongkan, sistem secara otomatis merender peta interaktif dari Nama Gedung &amp; Alamat di atas.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* MODUL 3: AMPLOP DIGITAL (3 REKENING BANK) */}
                  <div className="content-card">
                    <div className="card-header-row">
                      <div className="card-header-left">
                        <div className="card-icon-wrap">
                          <CreditCard size={18} className="admin-icon-blue" />
                        </div>
                        <div>
                          <h4 className="card-headline font-serif">Amplop Digital (Rekening Bank &amp; E-Wallet)</h4>
                          <p className="card-subhead">Kelola daftar rekening bank atau dompet digital untuk tanda kasih para tamu</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleAddBankAccount}
                        className="btn-gold"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.82rem', padding: '0.55rem 1rem' }}
                      >
                        <Plus size={15} />
                        <span>Tambah Rekening</span>
                      </button>
                    </div>

                    {(!settingsForm.bankAccounts || settingsForm.bankAccounts.length === 0) ? (
                      <div className="empty-bank-box" style={{ textAlign: 'center', padding: '2.5rem 1.5rem', background: 'rgba(6, 20, 50, 0.65)', borderRadius: '14px', border: '1.5px dashed rgba(147, 197, 253, 0.35)' }}>
                        <CreditCard size={32} className="admin-icon-blue" style={{ opacity: 0.6, margin: '0 auto 0.8rem' }} />
                        <h5 style={{ color: '#ffffff', fontSize: '1.05rem', marginBottom: '0.4rem' }}>Belum Ada Rekening Ditambahkan</h5>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem', maxWidth: '420px', margin: '0 auto 1.4rem' }}>
                          Tambahkan nomor rekening bank atau e-wallet agar para tamu undangan dapat mengirimkan tanda kasih dengan mudah.
                        </p>
                        <button
                          type="button"
                          onClick={handleAddBankAccount}
                          className="btn-gold"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.85rem', padding: '0.65rem 1.3rem' }}
                        >
                          <Plus size={15} />
                          <span>+ Tambah Rekening Pertama</span>
                        </button>
                      </div>
                    ) : (
                      <div className="bank-accounts-dynamic-list" style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                        {settingsForm.bankAccounts.map((acc, index) => (
                          <div key={index} className="bank-item-row-card" style={{ background: 'rgba(6, 20, 50, 0.88)', border: '1px solid rgba(147, 197, 253, 0.35)', borderRadius: '14px', padding: '1.25rem' }}>
                            <div className="bank-item-topbar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid rgba(147, 197, 253, 0.15)', paddingBottom: '0.65rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                                <span className="bank-item-num-badge" style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(56, 189, 248, 0.2)', border: '1px solid rgba(56, 189, 248, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.74rem', fontWeight: '700', color: '#bae6fd' }}>
                                  {index + 1}
                                </span>
                                <span style={{ fontWeight: '700', color: '#ffffff', fontSize: '0.95rem' }}>
                                  {acc.bank || `Rekening #${index + 1}`}
                                </span>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleRemoveBankAccount(index)}
                                className="btn-delete-bank"
                                title="Hapus rekening ini"
                              >
                                <Trash2 size={13} />
                                <span>Hapus</span>
                              </button>
                            </div>

                            <div className="bank-fields-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '0.9rem' }}>
                              <div className="form-field-group">
                                <label className="field-label">Nama Bank / E-Wallet</label>
                                <input
                                  type="text"
                                  value={acc.bank}
                                  onChange={(e) => handleBankAccountChange(index, 'bank', e.target.value)}
                                  className="admin-input modern-input"
                                  placeholder="Contoh: BCA, Mandiri, BRI, BSI, DANA"
                                  list={`bank-presets-${index}`}
                                />
                                <datalist id={`bank-presets-${index}`}>
                                  <option value="BCA" />
                                  <option value="Mandiri" />
                                  <option value="BRI" />
                                  <option value="BNI" />
                                  <option value="BSI (Bank Syariah Indonesia)" />
                                  <option value="CIMB Niaga" />
                                  <option value="Bank Jago" />
                                  <option value="SeaBank" />
                                  <option value="Permata" />
                                  <option value="DANA" />
                                  <option value="OVO" />
                                  <option value="GoPay" />
                                  <option value="ShopeePay" />
                                </datalist>
                              </div>

                              <div className="form-field-group">
                                <label className="field-label">Nomor Rekening / No. HP</label>
                                <input
                                  type="text"
                                  value={acc.accountNumber}
                                  onChange={(e) => handleBankAccountChange(index, 'accountNumber', e.target.value)}
                                  className="admin-input modern-input font-mono"
                                  placeholder="Contoh: 8801234567 atau 081234567890"
                                />
                              </div>

                              <div className="form-field-group">
                                <label className="field-label">Atas Nama Pemilik Rekening</label>
                                <input
                                  type="text"
                                  value={acc.accountName}
                                  onChange={(e) => handleBankAccountChange(index, 'accountName', e.target.value)}
                                  className="admin-input modern-input"
                                  placeholder="Contoh: Putra Fajar Widianto"
                                />
                              </div>
                            </div>
                          </div>
                        ))}

                        <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '0.3rem' }}>
                          <button
                            type="button"
                            onClick={handleAddBankAccount}
                            className="btn-outline-gold"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.82rem', padding: '0.55rem 1.1rem' }}
                          >
                            <Plus size={14} />
                            <span>+ Tambah Rekening Lainnya</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* MODUL 4: MUSIK LATAR & AUDIO */}
                  <div className="content-card">
                    <div className="card-header-row">
                      <div className="card-header-left">
                        <div className="card-icon-wrap">
                          <Music size={18} className="admin-icon-blue" />
                        </div>
                        <div>
                          <h4 className="card-headline font-serif">Musik Latar (Audio Background)</h4>
                          <p className="card-subhead">Upload file audio MP3 yang diputar otomatis saat undangan dibuka</p>
                        </div>
                      </div>
                    </div>

                    {/* Alert jika terdeteksi link YouTube */}
                    {isYouTubeUrl(settingsForm.audioUrl) && (
                      <div style={{
                        background: '#fef2f2',
                        border: '1.5px solid #f87171',
                        borderRadius: '12px',
                        padding: '0.85rem 1rem',
                        marginBottom: '1rem',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.75rem'
                      }}>
                        <AlertCircle size={20} style={{ color: '#dc2626', flexShrink: 0, marginTop: '2px' }} />
                        <div style={{ fontSize: '0.82rem', color: '#991b1b', lineHeight: '1.45' }}>
                          <strong>Tautan YouTube Terdeteksi!</strong>
                          <p style={{ margin: '0.2rem 0 0 0' }}>
                            Link video YouTube tidak dapat diputar langsung oleh browser sebagai audio latar web. Silakan klik tombol <strong>"Pilih & Upload File Lagu"</strong> di bawah untuk mengunggah file MP3 lagu pernikahan Anda secara langsung.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Kotak Area Upload Lagu */}
                    <div style={{
                      background: '#f8fafc',
                      border: '2px dashed #005FD0',
                      borderRadius: '14px',
                      padding: '1.4rem 1.2rem',
                      textAlign: 'center',
                      marginBottom: '1.2rem',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.75rem',
                      transition: 'all 0.2s ease'
                    }}>
                      <div style={{
                        width: '52px',
                        height: '52px',
                        borderRadius: '50%',
                        background: 'rgba(0, 95, 208, 0.12)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#005FD0'
                      }}>
                        <Upload size={24} />
                      </div>

                      <div>
                        <h5 style={{ margin: '0 0 0.25rem 0', fontSize: '0.98rem', fontWeight: 700, color: '#1e293b' }}>
                          Upload Lagu Pernikahan Anda
                        </h5>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>
                          Format didukung: <strong>.MP3, .M4A, .WAV</strong> (Maksimal 25 MB)
                        </p>
                      </div>

                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleAudioFileUpload}
                        accept="audio/*,.mp3,.m4a,.wav,.ogg"
                        style={{ display: 'none' }}
                        id="input-audio-file"
                      />

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingAudio}
                        className="btn-gold"
                        id="btn-upload-audio-file"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.7rem 1.4rem',
                          borderRadius: '50px',
                          fontWeight: 700,
                          fontSize: '0.86rem',
                          cursor: isUploadingAudio ? 'wait' : 'pointer'
                        }}
                      >
                        {isUploadingAudio ? (
                          <>
                            <RefreshCw size={16} className="spin-slow" />
                            <span>{audioUploadProgress || 'Mengupload Lagu...'}</span>
                          </>
                        ) : (
                          <>
                            <Upload size={16} />
                            <span>Pilih & Upload File Lagu (.mp3)</span>
                          </>
                        )}
                      </button>

                      {isUploadingAudio && (
                        <div style={{ width: '100%', maxWidth: '280px', marginTop: '0.2rem' }}>
                          <div style={{ height: '5px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', background: '#005FD0', width: '80%', animation: 'pulse 1.5s infinite' }} />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Kartu Status Lagu Aktif & Preview Player */}
                    <div style={{
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.8rem'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.6rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <div style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '50%',
                            background: '#eff6ff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#005FD0',
                            flexShrink: 0
                          }}>
                            <Volume2 size={18} />
                          </div>
                          <div>
                            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
                              Lagu Aktif Saat Ini
                            </span>
                            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1e293b' }}>
                              {settingsForm.audioUrl === '/audio/wedding-song.mp3' || !settingsForm.audioUrl
                                ? '🎵 Musik Bawaan (Romantic Piano Melody)'
                                : isYouTubeUrl(settingsForm.audioUrl)
                                ? '❌ Link YouTube (Tidak bisa diputar)'
                                : '✨ Lagu Kustom Pengantin (Tersimpan di Cloud)'}
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          {/* Tombol Preview Putar / Jeda */}
                          <button
                            type="button"
                            onClick={handleTogglePreviewAudio}
                            className="btn-secondary"
                            id="btn-preview-audio"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.4rem',
                              padding: '0.48rem 0.95rem',
                              borderRadius: '50px',
                              fontSize: '0.78rem',
                              fontWeight: 600
                            }}
                          >
                            {previewPlaying ? (
                              <>
                                <Pause size={14} style={{ color: '#005FD0' }} />
                                <span>Jeda Lagu</span>
                              </>
                            ) : (
                              <>
                                <Play size={14} style={{ color: '#005FD0' }} />
                                <span>Putar Preview</span>
                              </>
                            )}
                          </button>

                          {/* Tombol Reset ke Lagu Bawaan */}
                          {settingsForm.audioUrl && settingsForm.audioUrl !== '/audio/wedding-song.mp3' && (
                            <button
                              type="button"
                              onClick={handleResetToDefaultAudio}
                              className="btn-secondary"
                              title="Kembalikan ke lagu romantis bawaan"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                padding: '0.48rem 0.85rem',
                                borderRadius: '50px',
                                fontSize: '0.76rem',
                                color: '#64748b'
                              }}
                            >
                              <RotateCcw size={13} />
                              <span>Gunakan Lagu Bawaan</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Native Audio Tag untuk Preview */}
                      <audio
                        ref={previewAudioRef}
                        src={settingsForm.audioUrl || '/audio/wedding-song.mp3'}
                        onEnded={() => setPreviewPlaying(false)}
                        onPause={() => setPreviewPlaying(false)}
                        onPlay={() => setPreviewPlaying(true)}
                      />

                      {/* URL / Path Lagu */}
                      <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.65rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            Tautan Audio:
                          </span>
                          <span style={{
                            fontSize: '0.73rem',
                            fontFamily: 'monospace',
                            color: isYouTubeUrl(settingsForm.audioUrl) ? '#dc2626' : '#005FD0',
                            maxWidth: '350px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {settingsForm.audioUrl || '/audio/wedding-song.mp3'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.65rem' }}>
                      💡 <em>Setelah mengupload lagu, pastikan klik tombol <strong>"Simpan Semua Perubahan"</strong> di bawah untuk menerapkan lagu ke undangan.</em>
                    </p>
                  </div>

                  {/* Sticky Bottom Save Action Bar */}
                  <div className="settings-save-bar">
                    <div className="save-bar-hint">
                      <CheckCircle size={16} className="text-white" />
                      <span>Perubahan langsung tersimpan ke database & terupdate di undangan</span>
                    </div>
                    <button 
                      type="submit" 
                      disabled={isSavingSettings}
                      className="btn-gold modern-save-btn" 
                      id="btn-save-admin-settings"
                    >
                      <Save size={16} />
                      <span>{isSavingSettings ? 'Menyimpan Perubahan...' : 'Simpan Semua Perubahan'}</span>
                    </button>
                  </div>

                </form>

              </div>
            )}
          </>
        )}

      </div>

      <style>{`
        /* ========================================================
           ADMIN DASHBOARD - ROYAL BLUE & CRYSTAL WHITE THEME
           Match exact pas foto blue (#005FD0) and pure white (#FFFFFF)
           ======================================================== */
        .admin-modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 30, 80, 0.72);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.2rem;
        }

        .admin-modal-window {
          background: #005FD0;
          background-image: 
            radial-gradient(circle at 50% 12%, rgba(255, 255, 255, 0.22) 0%, transparent 60%),
            radial-gradient(circle at 85% 45%, rgba(255, 255, 255, 0.15) 0%, transparent 45%),
            radial-gradient(circle at 15% 75%, rgba(255, 255, 255, 0.15) 0%, transparent 50%);
          border: 2px solid #ffffff;
          border-radius: 24px;
          max-width: 1060px;
          width: 95%;
          max-height: 92vh;
          overflow-y: auto;
          box-shadow: 0 30px 80px rgba(0, 20, 60, 0.6), 0 0 45px rgba(255, 255, 255, 0.35);
          display: flex;
          flex-direction: column;
          position: relative;
          color: #ffffff;
        }

        /* Custom Modal Scrollbar */
        .admin-modal-window::-webkit-scrollbar {
          width: 7px;
        }
        .admin-modal-window::-webkit-scrollbar-track {
          background: #004fb0;
        }
        .admin-modal-window::-webkit-scrollbar-thumb {
          background: #ffffff;
          border-radius: 4px;
        }
        .admin-modal-window::-webkit-scrollbar-thumb:hover {
          background: #bae6fd;
        }

        /* Modal Header */
        .admin-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.3rem 1.8rem;
          border-bottom: 2px solid rgba(255, 255, 255, 0.35);
          background: rgba(0, 75, 175, 0.98);
          position: sticky;
          top: 0;
          z-index: 20;
          backdrop-filter: blur(12px);
        }

        .admin-header-left {
          display: flex;
          align-items: center;
          gap: 0.9rem;
        }

        .header-icon-badge {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: #ffffff;
          border: 2px solid #ffffff;
          color: #005fd0;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.18);
          flex-shrink: 0;
        }

        .header-shield-icon {
          color: #005fd0;
        }

        .header-title-row {
          display: flex;
          align-items: center;
          gap: 0.65rem;
        }

        .admin-title {
          font-size: 1.25rem;
          font-weight: 800;
          color: #ffffff;
          margin: 0;
          letter-spacing: 0.3px;
        }

        .online-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          background: rgba(255, 255, 255, 0.22);
          border: 1.5px solid #ffffff;
          color: #ffffff;
          font-size: 0.72rem;
          font-weight: 700;
          padding: 0.15rem 0.6rem;
          border-radius: 50px;
        }

        .pulse-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #34d399;
          box-shadow: 0 0 8px #34d399;
          animation: pulseGreen 1.8s infinite;
        }

        @keyframes pulseGreen {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.3); }
        }

        .admin-subtitle {
          font-size: 0.8rem;
          color: #e0f2fe;
          margin: 0.2rem 0 0;
        }

        .admin-header-actions {
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }

        .header-action-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: rgba(255, 255, 255, 0.18);
          border: 1.5px solid #ffffff;
          color: #ffffff;
          font-size: 0.8rem;
          font-weight: 700;
          padding: 0.45rem 0.9rem;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .header-action-btn:hover {
          background: #ffffff;
          color: #005fd0;
        }

        .header-action-btn.logout:hover {
          background: #ef4444;
          border-color: #ef4444;
          color: #ffffff;
        }

        .admin-close-btn {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.16);
          border: 1.5px solid #ffffff;
          color: #ffffff;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .admin-close-btn:hover {
          background: #ffffff;
          color: #005fd0;
        }

        /* Toast Alert */
        .admin-toast {
          background: #ffffff;
          color: #005fd0;
          font-size: 0.85rem;
          font-weight: 700;
          padding: 0.75rem 1.4rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
          border-bottom: 2px solid rgba(0, 95, 208, 0.2);
        }

        /* Navigasi Tab Segmented */
        .admin-tabs-bar {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.65rem;
          padding: 0.85rem 1.6rem;
          background: rgba(0, 70, 160, 0.98);
          border-bottom: 2px solid rgba(255, 255, 255, 0.3);
          position: sticky;
          top: 0;
          z-index: 15;
          backdrop-filter: blur(10px);
        }

        .admin-tab-item {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.55rem;
          background: rgba(255, 255, 255, 0.14);
          border: 1.5px solid rgba(255, 255, 255, 0.35);
          color: #ffffff;
          padding: 0.65rem 0.8rem;
          border-radius: 12px;
          font-size: 0.86rem;
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s ease;
          width: 100%;
        }

        .admin-tab-item:hover {
          color: #005fd0;
          background: #ffffff;
          border-color: #ffffff;
          transform: translateY(-1px);
        }

        .admin-tab-item.active {
          background: #ffffff;
          color: #005fd0;
          border-color: #ffffff;
          box-shadow: 0 4px 18px rgba(0, 0, 0, 0.2);
        }

        .tab-pill-count {
          background: rgba(255, 255, 255, 0.25);
          color: #ffffff;
          font-size: 0.72rem;
          font-weight: 800;
          padding: 0.15rem 0.55rem;
          border-radius: 999px;
          line-height: 1;
        }

        .admin-tab-item.active .tab-pill-count {
          background: #005fd0;
          color: #ffffff;
        }

        .admin-tab-content {
          padding: 1.8rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        /* ========================================================
           TAB 1: 4 CARDS METRICS GRID & OVERVIEW
           ======================================================== */
        .stats-metric-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.1rem;
        }

        .metric-card {
          background: rgba(255, 255, 255, 0.16);
          border: 2px solid #ffffff;
          border-radius: 18px;
          padding: 1.35rem 1.15rem;
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
          box-shadow: 0 8px 25px rgba(0, 30, 80, 0.22);
          backdrop-filter: blur(16px);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .metric-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 30px rgba(0, 30, 80, 0.3);
        }

        .metric-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
        }

        .metric-lbl {
          font-size: 0.74rem;
          font-weight: 700;
          color: #ffffff;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .metric-icon-wrap {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: #ffffff;
          border: 1.5px solid #ffffff;
          color: #005fd0;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 3px 10px rgba(0, 0, 0, 0.15);
          flex-shrink: 0;
        }

        .metric-icon-wrap.emerald {
          color: #059669;
        }
        .metric-icon-wrap.sky {
          color: #0284c7;
        }
        .metric-icon-wrap.rose {
          color: #e11d48;
        }

        .metric-val {
          font-size: 2.2rem;
          font-weight: 800;
          color: #ffffff;
          line-height: 1.05;
          font-family: var(--font-sans);
          text-shadow: 0 2px 10px rgba(0, 30, 80, 0.3);
          margin: 0.15rem 0;
        }

        .metric-sub {
          font-size: 0.78rem;
          color: #e0f2fe;
          line-height: 1.45;
          margin: 0;
        }

        .metric-sub strong {
          color: #ffffff;
          font-weight: 700;
        }

        /* Content Card Frame */
        .content-card {
          background: rgba(255, 255, 255, 0.16);
          border: 2px solid #ffffff;
          border-radius: 18px;
          padding: 1.6rem;
          box-shadow: 0 10px 30px rgba(0, 30, 80, 0.22);
          backdrop-filter: blur(16px);
        }

        .card-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.3rem;
          padding-bottom: 0.8rem;
          border-bottom: 1.5px solid rgba(255, 255, 255, 0.28);
          flex-wrap: wrap;
          gap: 0.8rem;
        }

        .card-header-left {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .card-icon-wrap {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: #ffffff;
          border: 1.5px solid #ffffff;
          color: #005fd0;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 3px 10px rgba(0, 0, 0, 0.15);
          flex-shrink: 0;
        }

        .card-headline {
          font-size: 1.15rem;
          font-weight: 700;
          color: #ffffff;
          margin: 0;
        }

        .card-subhead {
          font-size: 0.82rem;
          color: #e0f2fe;
          margin: 0.15rem 0 0;
        }

        .btn-text-link {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: rgba(255, 255, 255, 0.18);
          border: 1.5px solid #ffffff;
          color: #ffffff;
          font-size: 0.78rem;
          font-weight: 700;
          padding: 0.4rem 0.85rem;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-text-link:hover {
          background: #ffffff;
          color: #005fd0;
        }

        /* Lokasi Peta Acara Cards */
        .location-cards-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.1rem;
        }

        .location-item-card {
          background: rgba(255, 255, 255, 0.14);
          border: 2px solid #ffffff;
          border-radius: 16px;
          padding: 1.3rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          box-shadow: 0 8px 25px rgba(0, 30, 80, 0.2);
          backdrop-filter: blur(12px);
        }

        .loc-badge-tag {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          align-self: flex-start;
          font-size: 0.76rem;
          font-weight: 800;
          padding: 0.25rem 0.75rem;
          border-radius: 50px;
          background: #ffffff;
          color: #005fd0;
          border: 1.5px solid #ffffff;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          margin-bottom: 0.2rem;
        }

        .loc-title {
          font-size: 1.15rem;
          font-weight: 700;
          color: #ffffff;
          margin: 0.2rem 0 0;
        }

        .loc-text {
          font-size: 0.85rem;
          color: #f0f9ff;
          line-height: 1.55;
          margin: 0;
          flex-grow: 1;
        }

        .loc-time-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          align-self: flex-start;
          background: rgba(255, 255, 255, 0.2);
          border: 1.5px solid #ffffff;
          color: #ffffff;
          font-size: 0.76rem;
          font-weight: 700;
          padding: 0.25rem 0.75rem;
          border-radius: 50px;
          margin-top: 0.3rem;
        }

        /* Export Banner */
        .export-banner-card {
          background: rgba(255, 255, 255, 0.16);
          border: 2px solid #ffffff;
          border-radius: 16px;
          padding: 1.4rem 1.6rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1.5rem;
          flex-wrap: wrap;
          box-shadow: 0 8px 25px rgba(0, 30, 80, 0.2);
        }

        .export-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .export-icon-box {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: #ffffff;
          border: 1.5px solid #ffffff;
          color: #005fd0;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          flex-shrink: 0;
        }

        .export-title {
          font-size: 1.05rem;
          font-weight: 700;
          color: #ffffff;
          margin: 0;
        }

        .export-desc {
          font-size: 0.82rem;
          color: #e0f2fe;
          margin: 0.2rem 0 0;
        }

        .export-action-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: #ffffff;
          color: #005fd0;
          font-weight: 800;
          font-size: 0.85rem;
          padding: 0.65rem 1.3rem;
          border-radius: 50px;
          border: 2px solid #ffffff;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
          text-decoration: none;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .export-action-btn:hover {
          background: #f0f9ff;
          color: #004fb0;
          transform: translateY(-1px);
        }

        /* ========================================================
           TAB 2: WHATSAPP GENERATOR & DAFTAR TAMU
           ======================================================== */
        .generator-two-col {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }

        .gen-col-inputs {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .form-field-group {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .field-label {
          font-size: 0.76rem;
          font-weight: 700;
          color: #ffffff;
          text-transform: uppercase;
          letter-spacing: 0.6px;
          margin-bottom: 0.2rem;
        }

        .gen-fields-row,
        .form-fields-row {
          display: flex;
          gap: 0.85rem;
        }

        .flex-1 {
          flex: 1;
        }

        .admin-input,
        .modern-input {
          width: 100%;
          padding: 0.75rem 1rem;
          background: #ffffff;
          border: 2px solid #ffffff;
          border-radius: 10px;
          color: #0f172a;
          font-size: 0.88rem;
          font-weight: 600;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
          transition: all 0.25s ease;
        }

        .admin-input:focus,
        .modern-input:focus {
          outline: none;
          border-color: #38bdf8;
          box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.5);
        }

        .admin-input::placeholder,
        .modern-input::placeholder {
          color: #64748b;
          font-weight: 500;
        }

        .input-with-prefix {
          position: relative;
          width: 100%;
        }

        .gen-btn-group {
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
          margin-top: 0.5rem;
        }

        .btn-gold,
        .save-guest-btn {
          background: #ffffff;
          color: #005fd0;
          border: 2px solid #ffffff;
          font-weight: 800;
          border-radius: 50px;
          padding: 0.7rem 1.4rem;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          transition: all 0.25s ease;
          font-size: 0.88rem;
        }

        .btn-gold:hover,
        .save-guest-btn:hover {
          background: #f0f9ff;
          color: #004fb0;
          transform: translateY(-1px);
        }

        .btn-wa-direct {
          background: #25d366;
          color: #ffffff;
          border: 2px solid #25d366;
          font-weight: 800;
          border-radius: 50px;
          padding: 0.7rem 1.4rem;
          box-shadow: 0 4px 15px rgba(37, 211, 102, 0.3);
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          transition: all 0.25s ease;
          font-size: 0.88rem;
        }

        .btn-wa-direct:hover {
          background: #1eb956;
          border-color: #1eb956;
          transform: translateY(-1px);
        }

        /* WhatsApp Editor Column */
        .gen-col-preview {
          background: rgba(255, 255, 255, 0.14);
          border: 2px solid #ffffff;
          border-radius: 16px;
          padding: 1.3rem;
          display: flex;
          flex-direction: column;
          gap: 0.9rem;
          box-shadow: 0 8px 25px rgba(0, 30, 80, 0.2);
        }

        .wa-editor-header {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          padding-bottom: 0.75rem;
          border-bottom: 1.5px solid rgba(255, 255, 255, 0.28);
        }

        .wa-editor-title-wrap {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
        }

        .wa-badge-icon {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          background: #ffffff;
          border: 1.5px solid #ffffff;
          color: #005fd0;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 3px 8px rgba(0, 0, 0, 0.12);
        }

        .wa-editor-heading-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .wa-editor-title {
          font-size: 0.95rem;
          font-weight: 700;
          color: #ffffff;
          margin: 0;
        }

        .wa-editor-sub {
          font-size: 0.76rem;
          color: #e0f2fe;
          margin: 0;
        }

        .wa-status-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid #ffffff;
          color: #ffffff;
          font-size: 0.72rem;
          font-weight: 700;
          padding: 0.18rem 0.6rem;
          border-radius: 50px;
        }

        .guest-sent-status-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.22rem 0.65rem;
          border-radius: 50px;
          font-size: 0.72rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          border: 1px solid transparent;
        }

        .guest-sent-status-pill.sent {
          background: #dcfce7;
          color: #15803d;
          border-color: #bbf7d0;
        }

        .guest-sent-status-pill.sent:hover {
          background: #bbf7d0;
          transform: translateY(-1px);
        }

        .guest-sent-status-pill.unsent {
          background: #f1f5f9;
          color: #64748b;
          border-color: #e2e8f0;
        }

        .guest-sent-status-pill.unsent:hover {
          background: #e2e8f0;
          transform: translateY(-1px);
        }

        .sent-summary-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.75rem;
          font-weight: 700;
          color: #005fd0;
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          padding: 0.15rem 0.55rem;
          border-radius: 50px;
          margin-left: 0.5rem;
        }

        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #34d399;
          box-shadow: 0 0 6px #34d399;
        }

        .status-dot.dirty {
          background: #f59e0b;
          box-shadow: 0 0 6px #f59e0b;
        }

        /* Variable Chips Row */
        .wa-variable-chips-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
          background: rgba(0, 48, 125, 0.65);
          padding: 0.45rem 0.75rem;
          border-radius: 10px;
          border: 1.5px dashed rgba(255, 255, 255, 0.4);
        }

        .chips-label {
          font-size: 0.72rem;
          font-weight: 700;
          color: #ffffff;
          text-transform: uppercase;
        }

        .var-chip {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          background: #ffffff;
          border: 1px solid #ffffff;
          color: #005fd0;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 0.25rem 0.65rem;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .var-chip:hover {
          background: #f0f9ff;
          transform: translateY(-1px);
        }

        .var-chip-code {
          font-family: monospace;
          font-weight: 800;
        }

        .var-chip-desc {
          color: #004fb0;
          font-size: 0.72rem;
        }

        .wa-editor-box {
          position: relative;
          width: 100%;
        }

        .wa-editor-textarea {
          width: 100%;
          background: #ffffff;
          border: 2px solid #ffffff;
          border-radius: 10px;
          color: #0f172a;
          font-family: var(--font-sans);
          font-size: 0.88rem;
          font-weight: 500;
          line-height: 1.6;
          resize: vertical;
          min-height: 220px;
          padding: 0.8rem;
          box-sizing: border-box;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
        }

        .wa-editor-textarea:focus {
          outline: none;
          border-color: #38bdf8;
          box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.5);
        }

        /* Recipient & URL Info Strip */
        .wa-preview-info-strip {
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
          background: rgba(0, 48, 125, 0.72);
          border: 1.5px solid rgba(255, 255, 255, 0.35);
          padding: 0.7rem 0.95rem;
          border-radius: 10px;
          font-size: 0.78rem;
        }

        .preview-info-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .preview-info-label {
          color: #e0f2fe;
          font-size: 0.76rem;
          font-weight: 500;
          white-space: nowrap;
        }

        .preview-info-name {
          color: #005fd0;
          font-weight: 800;
          font-size: 0.82rem;
          background: #ffffff;
          border: 1.5px solid #ffffff;
          padding: 0.15rem 0.6rem;
          border-radius: 6px;
          white-space: nowrap;
        }

        .preview-info-link-row {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          flex-wrap: wrap;
        }

        .preview-info-link-label {
          color: #bae6fd;
          font-size: 0.72rem;
          white-space: nowrap;
        }

        .preview-info-slug {
          font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
          color: #ffffff;
          font-size: 0.73rem;
          background: rgba(0, 30, 80, 0.85);
          padding: 0.25rem 0.6rem;
          border-radius: 5px;
          border: 1px solid rgba(255, 255, 255, 0.25);
          word-break: break-all;
          flex: 1;
          min-width: 0;
        }

        /* Action Bar */
        .wa-editor-action-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.6rem;
          flex-wrap: wrap;
          padding-top: 0.2rem;
        }

        .action-bar-left,
        .action-bar-right {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .btn-save-template {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          background: #ffffff;
          border: 2px solid #ffffff;
          color: #005fd0;
          font-size: 0.8rem;
          font-weight: 800;
          padding: 0.5rem 1.1rem;
          border-radius: 50px;
          cursor: pointer;
          box-shadow: 0 3px 12px rgba(0, 0, 0, 0.15);
          transition: all 0.2s ease;
        }

        .btn-save-template:hover:not(:disabled) {
          transform: translateY(-1px);
          background: #f0f9ff;
          color: #004fb0;
        }

        .btn-save-template.is-saved {
          background: rgba(255, 255, 255, 0.2);
          border-color: #ffffff;
          color: #ffffff;
          cursor: default;
          box-shadow: none;
        }

        .btn-reset-template {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          background: rgba(255, 255, 255, 0.15);
          border: 1.5px solid #ffffff;
          color: #ffffff;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 0.48rem 0.9rem;
          border-radius: 50px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-reset-template:hover {
          background: #ef4444;
          border-color: #ef4444;
          color: #ffffff;
        }

        /* ========================================================
           TAB 3: BUKU TAMU & TABEL DATA
           ======================================================== */
        .filter-toolbar-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          flex-wrap: wrap;
          margin-bottom: 1.2rem;
        }

        .filter-chips-group {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          flex-wrap: nowrap;
          overflow-x: auto;
          scrollbar-width: none;
          -webkit-overflow-scrolling: touch;
          max-width: 100%;
        }

        .filter-chips-group::-webkit-scrollbar {
          display: none;
        }

        .filter-chip {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          background: rgba(255, 255, 255, 0.14);
          border: 1.5px solid rgba(255, 255, 255, 0.35);
          color: #ffffff;
          font-size: 0.78rem;
          font-weight: 700;
          padding: 0.4rem 0.85rem;
          border-radius: 50px;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .filter-chip:hover {
          background: rgba(255, 255, 255, 0.25);
        }

        .filter-chip.active {
          background: #ffffff;
          color: #005fd0;
          border-color: #ffffff;
          font-weight: 800;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
        }

        .table-search-box {
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-icon {
          position: absolute;
          left: 0.85rem;
          color: #64748b;
          pointer-events: none;
        }

        .table-search-input {
          background: #ffffff;
          border: 2px solid #ffffff;
          border-radius: 50px;
          padding: 0.45rem 1.8rem 0.45rem 2.2rem;
          font-size: 0.82rem;
          color: #0f172a;
          font-weight: 600;
          outline: none;
          min-width: 220px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .clear-search-btn {
          position: absolute;
          right: 0.75rem;
          background: transparent;
          border: none;
          color: #64748b;
          cursor: pointer;
          display: flex;
          align-items: center;
        }

        .table-container {
          overflow-x: auto;
          margin-top: 0.8rem;
          border-radius: 12px;
        }

        .admin-modern-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          font-size: 0.85rem;
          color: #ffffff;
        }

        .admin-modern-table th {
          background: rgba(0, 60, 140, 0.85);
          color: #ffffff;
          font-weight: 700;
          padding: 0.85rem 1rem;
          text-align: left;
          border-bottom: 2px solid rgba(255, 255, 255, 0.3);
          font-size: 0.78rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .admin-modern-table td {
          padding: 0.9rem 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.15);
          vertical-align: middle;
        }

        .admin-modern-table tr:hover td {
          background: rgba(255, 255, 255, 0.08);
        }

        .guest-name-cell {
          display: flex;
          align-items: center;
          gap: 0.65rem;
        }

        .guest-initial-avatar {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: #ffffff;
          color: #005fd0;
          font-weight: 800;
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1.5px solid #ffffff;
          flex-shrink: 0;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
        }

        .guest-name-text {
          font-weight: 700;
          color: #ffffff;
          font-size: 0.9rem;
        }

        .guest-slug {
          font-size: 0.72rem;
          color: #bae6fd;
          font-family: monospace;
          display: block;
        }

        .phone-cell {
          white-space: nowrap;
        }

        .phone-badge {
          font-family: monospace;
          color: #ffffff;
          background: rgba(255, 255, 255, 0.18);
          border: 1px solid rgba(255, 255, 255, 0.3);
          padding: 0.2rem 0.55rem;
          border-radius: 6px;
          font-size: 0.78rem;
        }

        .badge-pill-cat {
          display: inline-block;
          font-size: 0.72rem;
          font-weight: 700;
          padding: 0.2rem 0.6rem;
          border-radius: 50px;
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid #ffffff;
          color: #ffffff;
        }

        .table-actions-row {
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .btn-action-wa {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          background: #25d366;
          color: #ffffff;
          font-weight: 700;
          font-size: 0.75rem;
          padding: 0.35rem 0.75rem;
          border-radius: 6px;
          text-decoration: none;
          border: 1px solid #25d366;
          transition: all 0.2s ease;
        }

        .btn-action-wa:hover {
          background: #1eb956;
        }

        .btn-copy-wa {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          background: rgba(255, 255, 255, 0.18);
          color: #ffffff;
          font-weight: 700;
          font-size: 0.75rem;
          padding: 0.35rem 0.75rem;
          border-radius: 6px;
          border: 1px solid rgba(255, 255, 255, 0.35);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-copy-wa:hover {
          background: #ffffff;
          color: #005fd0;
        }

        .btn-copy-wa.copied {
          background: #22c55e;
          border-color: #22c55e;
          color: #ffffff;
        }

        .btn-action-icon {
          width: 30px;
          height: 30px;
          border-radius: 6px;
          background: rgba(255, 255, 255, 0.15);
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-action-icon:hover {
          background: #ffffff;
          color: #005fd0;
        }

        .btn-action-icon.danger:hover {
          background: #ef4444;
          border-color: #ef4444;
          color: #ffffff;
        }

        .table-empty-cell {
          text-align: center;
          padding: 2.5rem 1rem;
          color: #e0f2fe;
          font-style: italic;
        }

        .wish-avatar-circle {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #ffffff;
          border: 1.5px solid #ffffff;
          color: #005fd0;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
        }

        .wish-message-cell {
          max-width: 320px;
        }

        .wish-message-text {
          font-size: 0.84rem;
          color: #f0f9ff;
          line-height: 1.5;
        }

        .wish-time-text {
          font-size: 0.72rem;
          color: #bae6fd;
          margin-top: 0.25rem;
        }

        .status-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.72rem;
          font-weight: 800;
          padding: 0.2rem 0.65rem;
          border-radius: 50px;
          border: 1.5px solid #ffffff;
          background: #ffffff;
        }

        .status-pill.hadir {
          color: #059669;
        }
        .status-pill.tidak_hadir {
          color: #e11d48;
        }
        .status-pill.ragu {
          color: #d97706;
        }

        .relationship-tag {
          display: inline-block;
          font-size: 0.72rem;
          font-weight: 700;
          color: #ffffff;
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid #ffffff;
          padding: 0.15rem 0.55rem;
          border-radius: 50px;
        }

        /* ========================================================
           TAB 4: EDIT UNDANGAN / PENGATURAN
           ======================================================== */
        .settings-form-layout {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-two-col-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.2rem;
        }

        .form-sub-panel {
          background: rgba(255, 255, 255, 0.14);
          border: 2px solid #ffffff;
          border-radius: 16px;
          padding: 1.3rem;
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }

        .sub-panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1.5px solid rgba(255, 255, 255, 0.25);
          padding-bottom: 0.6rem;
        }

        .badge-pill-cat.groom,
        .badge-pill-cat.bride,
        .badge-pill-cat.akad,
        .badge-pill-cat.resepsi {
          background: #ffffff;
          color: #005fd0;
          font-weight: 800;
          border: 1.5px solid #ffffff;
        }

        .admin-textarea {
          width: 100%;
          padding: 0.75rem 1rem;
          background: #ffffff;
          border: 2px solid #ffffff;
          border-radius: 10px;
          color: #0f172a;
          font-size: 0.88rem;
          font-weight: 500;
          line-height: 1.5;
          resize: vertical;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
        }

        .admin-textarea:focus {
          outline: none;
          border-color: #38bdf8;
          box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.5);
        }

        .empty-bank-box {
          text-align: center;
          padding: 2rem 1rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1.5px dashed rgba(255, 255, 255, 0.35);
          border-radius: 14px;
        }

        .bank-accounts-dynamic-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .bank-item-row-card {
          background: rgba(255, 255, 255, 0.14);
          border: 2px solid #ffffff;
          border-radius: 14px;
          padding: 1.2rem;
          display: flex;
          flex-direction: column;
          gap: 0.8rem;
          box-shadow: 0 4px 15px rgba(0, 30, 80, 0.15);
        }

        .bank-item-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
        }

        .bank-item-num-badge {
          font-size: 0.78rem;
          font-weight: 800;
          color: #ffffff;
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid #ffffff;
          padding: 0.2rem 0.65rem;
          border-radius: 50px;
        }

        .btn-delete-bank {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          background: #ef4444;
          color: #ffffff;
          border: 1.5px solid #ef4444;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 0.35rem 0.75rem;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-delete-bank:hover {
          background: #dc2626;
          border-color: #dc2626;
        }

        .bank-fields-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.85rem;
        }

        .btn-outline-gold {
          background: rgba(255, 255, 255, 0.15);
          color: #ffffff;
          border: 2px solid #ffffff;
          font-weight: 700;
          border-radius: 50px;
          padding: 0.65rem 1.3rem;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          transition: all 0.2s ease;
        }

        .btn-outline-gold:hover {
          background: #ffffff;
          color: #005fd0;
        }

        .btn-outline-gold.btn-sm {
          padding: 0.4rem 0.9rem;
          font-size: 0.78rem;
        }

        .settings-save-bar {
          position: sticky;
          bottom: 0;
          background: rgba(0, 65, 155, 0.98);
          border-top: 2px solid #ffffff;
          padding: 1.1rem 1.8rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          flex-wrap: wrap;
          margin: 1.5rem -1.8rem -1.8rem;
          box-shadow: 0 -10px 30px rgba(0, 30, 80, 0.4);
          z-index: 10;
        }

        .save-bar-hint {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.82rem;
          color: #e0f2fe;
        }

        .modern-save-btn {
          background: #ffffff;
          color: #005fd0;
          font-weight: 800;
          border: 2px solid #ffffff;
          border-radius: 50px;
          padding: 0.75rem 1.6rem;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
          transition: all 0.2s ease;
        }

        .modern-save-btn:hover {
          background: #f0f9ff;
          color: #004fb0;
          transform: translateY(-1px);
        }

        /* ========================================================
           LOGIN PORTAL SCREEN
           ======================================================== */
        .admin-login-screen {
          padding: 3.5rem 1.5rem;
          display: flex;
          justify-content: center;
        }

        .pin-box {
          max-width: 420px;
          width: 100%;
          background: rgba(255, 255, 255, 0.16);
          border: 2px solid #ffffff;
          border-radius: 20px;
          padding: 2.5rem 2rem;
          backdrop-filter: blur(16px);
          box-shadow: 0 15px 40px rgba(0, 30, 80, 0.3);
        }

        .pin-icon-wrap {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: #ffffff;
          border: 2px solid #ffffff;
          color: #005fd0;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.3rem;
        }

        .pin-title {
          font-size: 1.45rem;
          font-weight: 800;
          color: #ffffff;
          margin-bottom: 0.4rem;
        }

        .pin-desc {
          font-size: 0.86rem;
          color: #e0f2fe;
          margin-bottom: 1.8rem;
          line-height: 1.6;
        }

        .pin-form {
          display: flex;
          flex-direction: column;
          gap: 1.1rem;
        }

        .admin-login-fields {
          display: flex;
          flex-direction: column;
          gap: 0.9rem;
          text-align: left;
        }

        .login-field-box {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .login-field-lbl {
          font-size: 0.74rem;
          font-weight: 700;
          color: #ffffff;
          text-transform: uppercase;
          letter-spacing: 0.6px;
        }

        .login-input-field {
          width: 100%;
        }

        .pin-error-box {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          background: #ef4444;
          border: 1.5px solid #ffffff;
          color: #ffffff;
          font-size: 0.82rem;
          font-weight: 700;
          padding: 0.6rem 0.9rem;
          border-radius: 10px;
        }

        .pin-submit-btn {
          width: 100%;
          padding: 0.9rem;
          font-size: 0.92rem;
          font-weight: 800;
          border-radius: 50px;
          margin-top: 0.3rem;
          background: #ffffff;
          color: #005fd0;
          border: 2px solid #ffffff;
          cursor: pointer;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
          transition: all 0.2s ease;
        }

        .pin-submit-btn:hover {
          background: #f0f9ff;
          color: #004fb0;
        }

        .pin-hint-card {
          margin-top: 1.6rem;
          padding: 0.75rem 1rem;
          background: rgba(255, 255, 255, 0.14);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 10px;
          font-size: 0.78rem;
          color: #e0f2fe;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          text-align: left;
        }

        /* ========================================================
           RESPONSIVENESS
           ======================================================== */
        @media (max-width: 860px) {
          .stats-metric-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .admin-tabs-bar {
            grid-template-columns: repeat(2, 1fr);
          }
          .location-cards-grid,
          .generator-two-col,
          .form-two-col-grid,
          .bank-fields-grid {
            grid-template-columns: 1fr;
          }
          .admin-tab-content {
            padding: 1.2rem;
          }
          .admin-modal-header {
            padding: 1rem 1.2rem;
          }
          .hide-mobile {
            display: none;
          }
          .export-banner-card {
            flex-direction: column;
            align-items: flex-start;
          }
          .export-action-btn {
            width: 100%;
            text-align: center;
          }
          .settings-save-bar {
            flex-direction: column;
            gap: 0.8rem;
            align-items: stretch;
          }
          .modern-save-btn {
            width: 100%;
          }
        }

        @media (max-width: 480px) {
          .stats-metric-grid {
            grid-template-columns: 1fr;
          }
          .admin-tabs-bar {
            grid-template-columns: 1fr;
          }
          .gen-fields-row,
          .form-fields-row {
            flex-direction: column;
          }
        }
      
        /* ========================================================
           ROYAL BLUE ICON RULES (#005FD0)
           Ensure all icons on white badges and cards are vibrant blue
           ======================================================== */
        .admin-icon-blue,
        .card-icon-wrap svg,
        .export-icon-box svg,
        .pin-icon-wrap svg,
        .header-icon-badge svg,
        .header-shield-icon,
        .wa-badge-icon svg,
        .admin-tab-item.active svg,
        .btn-gold svg,
        .modern-save-btn svg,
        .save-guest-btn svg,
        .btn-save-template:not(.is-saved) svg,
        .btn-text-link svg,
        .loc-badge-tag svg,
        .search-icon svg,
        .var-chip svg {
          color: #005FD0 !important;
          stroke: #005FD0 !important;
        }

        .metric-icon-wrap svg {
          color: #005FD0 !important;
          stroke: #005FD0 !important;
        }

        .metric-icon-wrap.emerald svg {
          color: #059669 !important;
          stroke: #059669 !important;
        }

        .metric-icon-wrap.sky svg {
          color: #0284c7 !important;
          stroke: #0284c7 !important;
        }

        .metric-icon-wrap.rose svg {
          color: #e11d48 !important;
          stroke: #e11d48 !important;
        }

        .btn-text-link {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: #ffffff;
          border: 1.5px solid #ffffff;
          color: #005FD0;
          font-size: 0.78rem;
          font-weight: 800;
          padding: 0.35rem 0.85rem;
          border-radius: 8px;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
          transition: all 0.2s ease;
        }

        .btn-text-link:hover {
          background: #f0f9ff;
          color: #004fb0;
          transform: translateY(-1px);
        }

        /* ========================================================
           Mobile & iPhone Responsiveness for Dashboard
           ======================================================== */
        @media (max-width: 768px) {
          .admin-modal-backdrop {
            padding: 0.4rem;
          }
          .admin-modal-window {
            width: 100%;
            max-width: 100%;
            max-height: 96vh;
            border-radius: 16px;
          }
          .admin-modal-header {
            padding: 0.85rem 1rem;
            flex-wrap: wrap;
            gap: 0.6rem;
          }
          .admin-title {
            font-size: 1.12rem;
            line-height: 1.3;
          }
          .admin-subtitle {
            font-size: 0.72rem;
            line-height: 1.3;
          }
          .admin-tabs-nav {
            overflow-x: auto;
            white-space: nowrap;
            -webkit-overflow-scrolling: touch;
            padding: 0.5rem 0.75rem;
            gap: 0.4rem;
          }
          .admin-tab-item {
            padding: 0.5rem 0.8rem;
            font-size: 0.8rem;
            flex-shrink: 0;
            white-space: nowrap;
          }
          .stats-grid-row, .metrics-grid, .summary-cards-grid {
            display: grid !important;
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 0.75rem !important;
          }
          .generator-two-cols, .wa-generator-grid {
            display: flex !important;
            flex-direction: column !important;
            gap: 1.2rem !important;
          }
          .form-fields-row, .form-two-col-grid {
            display: flex !important;
            flex-direction: column !important;
            gap: 0.85rem !important;
          }
          .table-container {
            overflow-x: auto !important;
            -webkit-overflow-scrolling: touch;
            width: 100%;
            display: block;
            margin-top: 0.8rem;
          }
          .admin-modern-table {
            min-width: 520px;
          }
          .content-card {
            padding: 1.3rem 1.1rem !important;
            border-radius: 14px !important;
          }
          .admin-input, .admin-select, .admin-textarea, input, select, textarea {
            font-size: 16px !important; /* Prevents auto-zoom on iPhone Safari */
          }
          .hide-mobile {
            display: none !important;
          }
        }

        @media (max-width: 480px) {
          .stats-grid-row, .metrics-grid, .summary-cards-grid {
            grid-template-columns: 1fr !important;
          }
          .card-headline {
            font-size: 1.12rem !important;
          }
          .header-icon-badge {
            width: 36px;
            height: 36px;
          }
          .admin-header-actions {
            gap: 0.35rem;
          }
          .header-action-btn {
            padding: 0.35rem 0.6rem;
            font-size: 0.75rem;
          }
          .card-header-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.6rem;
          }
        }

      `}</style>
    </div>
  );
}
