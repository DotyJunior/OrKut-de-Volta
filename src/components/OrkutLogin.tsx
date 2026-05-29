import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import OrkutCaptcha from './OrkutCaptcha';
import { 
  Lock, 
  Mail, 
  User, 
  Phone, 
  RefreshCw, 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail 
} from 'firebase/auth';
import { doc, setDoc, getDocs, collection, query, where, getDoc } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';
import { Profile } from '../types';

interface OrkutLoginProps {
  onLoginSuccess: (userProfile: Profile, isDemo: boolean) => void;
  defaultProfiles: Record<string, Profile>;
}

export default function OrkutLogin({ onLoginSuccess, defaultProfiles }: OrkutLoginProps) {
  const [view, setView] = useState<'login' | 'register' | 'recover'>('login');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Captcha Anti-Bot
  const [attempts, setAttempts] = useState(0);
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [pendingAction, setPendingAction] = useState<'login' | 'register' | null>(null);

  // Form Fields - Login
  const [loginInput, setLoginInput] = useState(''); // Email or Username
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // Form Fields - Register
  const [regFullName, setRegFullName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regAgreeTerms, setRegAgreeTerms] = useState(true);
  const [regAvatarIndex, setRegAvatarIndex] = useState(0);

  // SMS Phone Verification states
  const [showSmsModal, setShowSmsModal] = useState(false);
  const [generatedSmsCode, setGeneratedSmsCode] = useState('');
  const [userSmsInput, setUserSmsInput] = useState('');
  const [smsError, setSmsError] = useState('');
  const [smsSuccessNotification, setSmsSuccessNotification] = useState<string | null>(null);

  // Form Fields - Recover
  const [recoverEmail, setRecoverEmail] = useState('');

  // Retro Avatar Presets
  const avatarPresets = [
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150', // Default Classic Boy Blue
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', // Girl Pink
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', // Developer Boy Retro
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150', // Indie Pixie Yellow
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', // Emo Girl 2008
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150'  // Retro Hacker Shady
  ];

  // Helper: Sanitize alphanumeric strings (prevents HTML/script/XSS in names/usernames)
  const sanitizeInput = (val: string) => {
    return val.replace(/[<>'"&/]/g, '').trim();
  };

  // Refactored helper: Core Login Executor
  const executeLogin = async () => {
    setIsProcessing(true);
    setErrorMessage('');
    const cleanInput = loginInput.trim();

    try {
      // 1.5 Seconds Debounce Delay to prevent spam / brute-force
      await new Promise((resolve) => setTimeout(resolve, 1500));

      let targetEmail = cleanInput;

      // Handle username-based login logic:
      // If the input doesn't look like an email, we search Firestore for a profile with matching username!
      if (!cleanInput.includes('@')) {
        const usernameQuery = query(
          collection(db, 'profiles'),
          where('username', '==', cleanInput.toLowerCase().trim())
        );
        const querySnapshot = await getDocs(usernameQuery);
        
        if (querySnapshot.empty) {
          // If we are offline or default profiles are needed, check default profiles list
          const foundDefault = Object.values(defaultProfiles).find(
            (p) => p.username?.toLowerCase().trim() === cleanInput.toLowerCase().trim()
          );

          if (foundDefault) {
            // Found a default user profile in state! Log in as demo character
            setIsProcessing(false);
            onLoginSuccess(foundDefault, true);
            return;
          } else {
            throw new Error('Usuário não encontrado. Verifique seu nome de usuário ou e-mail.');
          }
        }

        const userDoc = querySnapshot.docs[0];
        const profileData = userDoc.data() as Profile & { email?: string };
        if (profileData.email) {
          targetEmail = profileData.email;
        } else {
          throw new Error('Este perfil de usuário correspondente não possui um e-mail válido para autenticação.');
        }
      }

      // Perform Google Firebase Secure Sign in
      const userCredential = await signInWithEmailAndPassword(auth, targetEmail, loginPassword);
      const uid = userCredential.user.uid;

      // Load Firestore Profile
      const docRef = doc(db, 'profiles', uid);
      const docSnap = await getDoc(docRef);

      let loggedProfile: Profile;
      if (docSnap.exists()) {
        loggedProfile = docSnap.data() as Profile;
      } else {
        // Fallback or seed default profile if first-time oauth / external user
        loggedProfile = {
          id: uid,
          name: userCredential.user.displayName || sanitizeInput(cleanInput.split('@')[0]),
          avatar: avatarPresets[0],
          location: 'Curitiba, PR - Brasil',
          relationship: 'Solteiro',
          humor: 'Amigável',
          hereFor: 'Amigos',
          fashion: 'Básico',
          religion: 'Nenhuma',
          ethnicity: 'Brasileiro',
          languages: 'Português',
          hometown: 'Curitiba',
          webpage: '',
          passions: 'Scrapzone segura',
          aboutMe: 'Acabei de entrar nesta incrível rede social humana e segura!',
          trusty: 3,
          cool: 3,
          sexy: 3,
          fans: 0,
          username: cleanInput.split('@')[0],
          theme: 'default',
          statusOnline: '● Online Agora'
        };
        await setDoc(docRef, loggedProfile);
      }

      // If remember me is checked, we can simulate an auth cookie / local state indicator
      if (rememberMe) {
        localStorage.setItem('orkut_remember_uid', uid);
      } else {
        localStorage.removeItem('orkut_remember_uid');
      }

      setIsProcessing(false);
      onLoginSuccess(loggedProfile, false);

    } catch (err: any) {
      console.error('Firebase Auth Login Error: ', err);
      // Increment attempt counter upon failure!
      setAttempts(prev => prev + 1);

      let clientMsg = 'Erro ao realizar login. Verifique suas credenciais.';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        clientMsg = 'E-mail, usuário ou senha inválidos. Tente novamente!';
      } else if (err.code === 'auth/too-many-requests') {
        clientMsg = 'Múltiplas tentativas incorretas. Sessão bloqueada por brute-force. Aguarde alguns minutos.';
      } else if (err.message) {
        clientMsg = err.message;
      }
      setErrorMessage(clientMsg);
      setIsProcessing(false);
    }
  };

  // Login processing with 1.5s security debounce built-in
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const cleanInput = loginInput.trim();
    if (!cleanInput) {
      setErrorMessage('Por favor, informe seu e-mail ou nome de usuário.');
      return;
    }
    if (!loginPassword) {
      setErrorMessage('Por favor, insira sua senha.');
      return;
    }

    // Smart Activation: If we have failed login attempts or suspect activity, trigger Captcha!
    if (attempts >= 1) {
      setPendingAction('login');
      setShowCaptcha(true);
      return;
    }

    await executeLogin();
  };

  // Refactored helper: Core Registration Executor
  const executeRegister = async () => {
    setIsProcessing(true);
    setErrorMessage('');
    setSuccessMessage('');

    const cleanName = sanitizeInput(regFullName);
    const cleanUsername = sanitizeInput(regUsername).toLowerCase().replace(/\s+/g, '');
    const cleanEmail = regEmail.trim();
    const cleanPhone = sanitizeInput(regPhone);

    try {
      // 1.5 Seconds Debounce delay for registration security
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Check if username is already taken in database
      const usernameQuery = query(
        collection(db, 'profiles'),
        where('username', '==', cleanUsername)
      );
      const querySnapshot = await getDocs(usernameQuery);
      
      const isTakenByDefault = Object.values(defaultProfiles).some(
        (p) => p.username?.toLowerCase() === cleanUsername
      );

      if (!querySnapshot.empty || isTakenByDefault) {
        throw new Error(`O usuário @${cleanUsername} já está registrado. Escolha outro nome.`);
      }

      // Create authentication credentials using Firebase Secure Auth
      const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, regPassword);
      const uid = userCredential.user.uid;

      // Build User profile record
      const newUserProfile: any = {
        id: uid,
        name: cleanName,
        username: cleanUsername,
        email: cleanEmail,
        phone: cleanPhone,
        avatar: avatarPresets[regAvatarIndex],
        location: 'Paraná, Brasil',
        relationship: 'Solteiro',
        humor: 'Sempre Alegre',
        hereFor: 'Fazer Amizades',
        fashion: 'Clássico 2004',
        religion: 'Universal',
        ethnicity: 'Brasileiro',
        languages: 'Português',
        hometown: 'Curitiba',
        webpage: '',
        passions: 'Música retro, scraps seguros, comunidades clássicas',
        aboutMe: 'Oi, acabei de criar minha conta no Scrapzone! Mandem recados, fiquem à vontade para bisbilhotar o meu perfil e adicionar aos favoritos. 😉',
        trusty: 3,
        cool: 3,
        sexy: 3,
        fans: 0,
        theme: 'default',
        statusOnline: '● Online Agora'
      };

      // Set profile doc in firestore
      await setDoc(doc(db, 'profiles', uid), newUserProfile);

      // Join default communities automatically (making them feel welcome!)
      await setDoc(doc(db, 'joined_communities', uid), {
        userId: uid,
        communityIds: ['1', '3'] // 'Eu odeio acordar cedo' and 'Eu amo chocolate preto'
      });

      setSuccessMessage('Conta comunitária criada com absoluto sucesso! Bem-vindo.');
      setIsProcessing(false);
      
      // Delay transition to auto login as them
      setTimeout(() => {
        onLoginSuccess(newUserProfile, false);
      }, 1000);

    } catch (err: any) {
      console.error('Registration Error: ', err);
      // Fail increments the login/register attempt counter
      setAttempts(prev => prev + 1);

      let clientMsg = 'Ocorreu um erro ao criar seu cadastro. Tente novamente.';
      if (err.code === 'auth/email-already-in-use') {
        clientMsg = 'Este endereço de e-mail já está em uso por outro membro.';
      } else if (err.code === 'auth/invalid-email') {
        clientMsg = 'O endereço de e-mail digitado é inválido.';
      } else if (err.message) {
        clientMsg = err.message;
      }
      setErrorMessage(clientMsg);
      setIsProcessing(false);
    }
  };

  // SMS simulation trigger
  const sendSmsCode = (phone: string) => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedSmsCode(code);
    setUserSmsInput('');
    setSmsError('');
    
    // Show high-fidelity SMS notification toast on screen of the browser
    setSmsSuccessNotification(`📱 Novo SMS recebido no número ${phone}:\n[Scrapzone Secure] codigo de seguranca: ${code}. Guarde com seguranca.`);
  };

  const handleVerifySmsAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setSmsError('');

    if (userSmsInput.trim() !== generatedSmsCode) {
      setSmsError('Código de verificação SMS inválido ou incorreto. Insira o código correto enviado.');
      return;
    }

    // Correct! Proceed to execute standard registration
    setShowSmsModal(false);
    setSmsSuccessNotification(null);
    await executeRegister();
  };

  // Register processing with 1.5s security debounce built-in
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    // Sanitization & Validation Backend-Equivalent Checks
    const cleanName = sanitizeInput(regFullName);
    const cleanUsername = sanitizeInput(regUsername).toLowerCase().replace(/\s+/g, '');
    const cleanEmail = regEmail.trim();
    const cleanPhone = sanitizeInput(regPhone);

    if (!cleanName || !cleanUsername || !cleanEmail || !cleanPhone || !regPassword) {
      setErrorMessage('Por favor, preencha todos os campos obrigatórios (Nome, Usuário, E-mail, Celular, Senha).');
      return;
    }

    const phoneDigits = cleanPhone.replace(/\D/g, '');
    if (phoneDigits.length < 10 || phoneDigits.length > 11) {
      setErrorMessage('Por favor, insira um celular válido com DDD (10 ou 11 dígitos, ex: 41991234567).');
      return;
    }

    if (cleanUsername.length < 3 || cleanUsername.length > 25) {
      setErrorMessage('O nome de usuário deve ter entre 3 e 25 caracteres literais.');
      return;
    }

    if (regPassword.length < 6) {
      setErrorMessage('Sua senha deve ter no mínimo 6 caracteres para garantir proteção criptográfica.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMessage('As senhas digitadas não conferem. Por favor, redigite.');
      return;
    }

    if (!regAgreeTerms) {
      setErrorMessage('Você deve aceitar as diretrizes de convivência comunitária e privacidade.');
      return;
    }

    // Protect registration automatically with CAPTCHA validation
    setPendingAction('register');
    setShowCaptcha(true);
  };

  // Forgot password processing with 1.5s security debounce built-in
  const handleRecoverSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const cleanEmail = recoverEmail.trim();
    if (!cleanEmail) {
      setErrorMessage('Por favor, informe seu e-mail cadastrado.');
      return;
    }

    setIsProcessing(true);

    try {
      // 1.5 Seconds Debounce delay for recovery safety
      await new Promise((resolve) => setTimeout(resolve, 1500));

      await sendPasswordResetEmail(auth, cleanEmail);
      
      setSuccessMessage('Link de redefinição enviado com sucesso para o seu e-mail do Firebase!');
      setRecoverEmail('');
      setIsProcessing(false);

    } catch (err: any) {
      console.error('Recovery Error: ', err);
      let clientMsg = 'Erro ao enviar e-mail de recuperação. Verifique se o e-mail está cadastrado.';
      if (err.code === 'auth/user-not-found') {
        clientMsg = 'Nenhuma conta comunitária encontrada com esta credencial de e-mail.';
      } else if (err.code === 'auth/invalid-email') {
        clientMsg = 'O formato do e-mail digitado é inválido.';
      } else if (err.message) {
        clientMsg = err.message;
      }
      setErrorMessage(clientMsg);
      setIsProcessing(false);
    }
  };

  // Demo Login Quick-Bypass for ease of testing
  const handleDemoLogin = (profileKey: string) => {
    const profile = defaultProfiles[profileKey];
    if (profile) {
      setIsProcessing(true);
      setTimeout(() => {
        setIsProcessing(false);
        onLoginSuccess(profile, true);
      }, 500);
    }
  };

  const handleCaptchaSuccess = async () => {
    setShowCaptcha(false);
    const action = pendingAction;
    setPendingAction(null);

    if (action === 'login') {
      await executeLogin();
    } else if (action === 'register') {
      sendSmsCode(regPhone);
      setShowSmsModal(true);
    }
  };

  const handleCaptchaCancel = () => {
    setShowCaptcha(false);
    setPendingAction(null);
    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-[#cbdcf3] via-[#e2eaf5] to-[#fbcfe8] flex items-center justify-center p-4 sm:p-6 font-sans relative overflow-hidden selection:bg-[#fbcfe8]">
      
      {/* Dynamic Background Noise/Bubbles to feel like a friendly retro page */}
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#92afd9]/20 to-transparent pointer-events-none" />
      <div className="absolute -left-12 -bottom-12 w-[350px] h-[350px] bg-[#fbcfe8]/40 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute -right-12 -top-12 w-[350px] h-[350px] bg-[#dbe4f1]/40 blur-3xl rounded-full pointer-events-none" />

      {/* Main Login Frame Container Layout */}
      <div className="max-w-4xl w-full flex flex-col md:flex-row items-stretch gap-6 md:gap-12 relative z-10 my-6">
        
        {/* LEFT COLUMN: Old web social greeting and description banner */}
        <div className="flex-1 flex flex-col justify-center text-center md:text-left py-4 px-2 md:px-0">
          
          {/* Logo Brand image logo */}
          <div className="flex justify-center md:justify-start items-center gap-1.5 mb-6 animate-fade-in select-none">
            <img 
              src="https://i.imgur.com/dhYT8Fa.png" 
              alt="Scrapzone Logo" 
              className="h-[210px] md:h-[220px] object-contain"
              referrerPolicy="no-referrer"
            />
          </div>

          <h2 className="text-xl md:text-2xl font-bold text-[#1b4372] tracking-normal mb-6 leading-snug">
            Reconecte-se novamente em uma rede segura e amigável.
          </h2>

          {/* Retro Bullet Points exactly matching the screenshot vibe */}
          <div className="space-y-4 md:space-y-5 text-left max-w-md mx-auto md:mx-0">
            <div className="flex items-start gap-3">
              <div className="bg-[#dee7f4] text-[#1d4ed8] p-1.5 rounded-full mt-0.5 flex-shrink-0 border border-[#adc3df]">
                <Users size={15} />
              </div>
              <p className="text-[12.5px] leading-relaxed text-[#384b65] font-sans">
                <strong className="text-[#0d213f] font-semibold">Conecte-se</strong> aos seus amigos e familiares resgatando as saudosas mensagens da antiga internet em um ambiente blindado contra XSS.
              </p>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-[#dee7f4] text-[#1d4ed8] p-1.5 rounded-full mt-0.5 flex-shrink-0 border border-[#adc3df]">
                <CheckCircle2 size={15} />
              </div>
              <p className="text-[12.5px] leading-relaxed text-[#384b65] font-sans">
                <strong className="text-[#0d213f] font-semibold">Conheça novas pessoas</strong> por meio dos amigos dos seus amigos e troque scraps, participe de comunidades saudáveis de debate.
              </p>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-[#dee7f4] text-[#1d4ed8] p-1.5 rounded-full mt-0.5 flex-shrink-0 border border-[#adc3df]">
                <Lock size={15} />
              </div>
              <p className="text-[12.5px] leading-relaxed text-[#384b65] font-sans">
                <strong className="text-[#0d213f] font-semibold">Mensagens 100% Criptografadas</strong> no navegador com WebCrypto de ponta a ponta e heap de memória isolado na verificação.
              </p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-[#dee7f4] text-center md:text-left flex items-center justify-center md:justify-start gap-2">
            <div className="bg-[#0b1f3c] border border-[#0d264a] text-yellow-500 font-extrabold rounded px-2.5 py-1 text-[9.5px] uppercase tracking-tight select-none inline-flex items-center gap-1.5">
              <span>🛡️</span>
              <span className="text-white font-sans text-[9px] font-semibold opacity-90">SEGURANÇA POR FIREBASE HARDENING</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: The Interactive White Card Form */}
        <div className="flex-1 max-w-sm md:max-w-md w-full mx-auto flex items-center">
          
          <div className="w-full bg-white border border-[#92afd9] rounded shadow-[0_4px_24px_rgba(29,67,114,0.08)] bg-radial from-white to-[#fdfeff] overflow-hidden flex flex-col p-6 sm:p-8 min-h-[440px]">
            
            <AnimatePresence mode="wait">
              
              {/* VIEW: LOGIN FORM */}
              {view === 'login' && (
                <motion.div
                  key="login-view"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.18 }}
                  className="flex flex-col flex-1"
                >
                  <div className="mb-5 text-center sm:text-left border-b border-neutral-100 pb-3">
                    <h3 className="text-lg font-black text-[#1b4372] tracking-tight font-sans">
                      Acesse o Scrapzone
                    </h3>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Insira seus dados para reconectar-se com segurança
                    </p>
                  </div>

                  {/* Form inputs */}
                  <form onSubmit={handleLoginSubmit} className="space-y-4 flex-1">
                    
                    {/* Error Alerts */}
                    {errorMessage && (
                      <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-sm text-xs flex items-start gap-2 font-sans">
                        <AlertCircle size={15} className="flex-shrink-0 mt-0.5 text-rose-600" />
                        <span>{errorMessage}</span>
                      </div>
                    )}

                    {successMessage && (
                      <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-sm text-xs flex items-start gap-2 font-sans">
                        <CheckCircle size={15} className="flex-shrink-0 mt-0.5 text-emerald-600" />
                        <span>{successMessage}</span>
                      </div>
                    )}

                    {/* Email / Username field */}
                    <div className="space-y-1">
                      <label className="block text-[11px] font-black text-neutral-600 uppercase tracking-wide">
                        E-mail ou Nome de Usuário:
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-neutral-400">
                          <User size={13} />
                        </span>
                        <input
                          id="login-username-input"
                          type="text"
                          value={loginInput}
                          onChange={(e) => setLoginInput(e.target.value)}
                          placeholder="Ex: junior.sombra ou junior@gmail.com"
                          disabled={isProcessing}
                          className="w-full text-xs pl-9 pr-3 py-2 border border-neutral-300 rounded focus:border-[#406a94] focus:outline-none focus:ring-1 focus:ring-[#406a94]/30 bg-neutral-50/55 text-neutral-800 font-sans shadow-inner"
                        />
                      </div>
                    </div>

                    {/* Password field */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <label className="block text-[11px] font-black text-neutral-600 uppercase tracking-wide">
                          Senha Secreta:
                        </label>
                        <button
                          type="button"
                          onClick={() => setView('recover')}
                          className="text-[10px] text-[#406a94] hover:underline font-semibold"
                        >
                          Esqueceu a senha?
                        </button>
                      </div>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-neutral-400">
                          <Lock size={13} />
                        </span>
                        <input
                          id="login-password-input"
                          type={showPassword ? 'text' : 'password'}
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder="Digite seus caracteres secretos"
                          disabled={isProcessing}
                          className="w-full text-xs pl-9 pr-10 py-2 border border-neutral-300 rounded focus:border-[#406a94] focus:outline-none focus:ring-1 focus:ring-[#406a94]/30 bg-neutral-50/55 text-neutral-800 font-sans shadow-inner"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-600 transition-colors cursor-pointer"
                        >
                          {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </div>

                    {/* Remember me option */}
                    <div className="flex items-center gap-2 pt-1 font-sans">
                      <input
                        id="login-remember-checkbox"
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        disabled={isProcessing}
                        className="h-3.5 w-3.5 border-neutral-300 rounded text-[#1b4372] focus:ring-[#406a94] focus:ring-offset-0 cursor-pointer"
                      />
                      <label 
                        htmlFor="login-remember-checkbox" 
                        className="text-xs text-neutral-600 cursor-pointer select-none leading-none font-medium"
                      >
                        Salvar minhas informações neste computador
                      </label>
                    </div>

                    {/* Submit Button (Debounced 1.5s delay inside submit handler) */}
                    <div className="pt-2">
                      <button
                        id="login-submit-button"
                        type="submit"
                        disabled={isProcessing}
                        className="w-full py-2.5 px-4 bg-[#dee7f4] hover:bg-[#c6d7ed] active:bg-[#a9c4e5] border border-[#adc3df] text-[#1b4372] hover:text-[#0f345e] font-black font-sans text-xs uppercase tracking-wide rounded transition-all cursor-pointer shadow-xs disabled:opacity-60 flex items-center justify-center gap-2"
                      >
                        {isProcessing ? (
                          <>
                            <RefreshCw className="animate-spin text-[#1b4372]" size={14} />
                            <span>Verificando Integridade (1.5s)...</span>
                          </>
                        ) : (
                          <span>Entrar com Segurança</span>
                        )}
                      </button>
                    </div>

                    {/* Navigation Switchers */}
                    <div className="text-center pt-4 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-xs font-sans text-neutral-500">
                      <span>Não possui registro comunitário?</span>
                      <button
                        type="button"
                        onClick={() => {
                          setErrorMessage('');
                          setSuccessMessage('');
                          setView('register');
                        }}
                        className="text-[#103056] font-extrabold hover:underline select-none border-b border-[#103056]/30 uppercase text-[10.5px] tracking-tight"
                      >
                        Cadastre-se Já
                      </button>
                    </div>

                  </form>
                </motion.div>
              )}

              {/* VIEW: REGISTER / SIGN UP FORM */}
              {view === 'register' && (
                <motion.div
                  key="register-view"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.18 }}
                  className="flex flex-col flex-1"
                >
                  <div className="mb-4 text-center sm:text-left border-b border-neutral-100 pb-2.5">
                    <h3 className="text-lg font-black text-[#1b4372] tracking-tight font-sans">
                      Novo Registro no Scrapzone
                    </h3>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Crie sua conta para participar da nossa rede social humana
                    </p>
                  </div>

                  <form onSubmit={handleRegisterSubmit} className="space-y-3.5 flex-1 max-h-[500px] overflow-y-auto pr-1">
                    
                    {errorMessage && (
                      <div className="bg-rose-50 border border-rose-200 text-rose-800 p-2.5 rounded text-xs flex items-start gap-2 font-sans">
                        <AlertCircle size={15} className="flex-shrink-0 mt-0.5 text-rose-600" />
                        <span>{errorMessage}</span>
                      </div>
                    )}

                    {successMessage && (
                      <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-2.5 rounded text-xs flex items-start gap-2 font-sans">
                        <CheckCircle size={15} className="flex-shrink-0 mt-0.5 text-emerald-600" />
                        <span>{successMessage}</span>
                      </div>
                    )}

                    {/* Choose Avatar Index */}
                    <div className="space-y-1.5 focus:outline-none">
                      <label className="block text-[11px] font-black text-neutral-600 uppercase tracking-wide">
                        Escolha sua Foto Clássica:
                      </label>
                      <div className="flex flex-wrap gap-2 justify-center py-1 bg-neutral-50 border border-dashed border-neutral-200 rounded p-2">
                        {avatarPresets.map((src, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setRegAvatarIndex(idx)}
                            className={`relative h-11 w-11 rounded-full overflow-hidden transition-all border-2 cursor-pointer ${
                              regAvatarIndex === idx ? 'border-[#ed3fa7] scale-110 shadow-md' : 'border-transparent opacity-65 hover:opacity-100'
                            }`}
                          >
                            <img src={src} alt={`Avatar Preset ${idx}`} className="h-full w-full object-cover" />
                            {regAvatarIndex === idx && (
                              <div className="absolute inset-0 bg-[#ed3fa7]/10 flex items-center justify-center">
                                <span className="text-white text-[10px] font-black">✓</span>
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Full Name */}
                    <div className="space-y-1">
                      <label className="block text-[11px] font-black text-neutral-600 uppercase tracking-wide">
                        Nome Completo: *
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-neutral-400">
                          <User size={13} />
                        </span>
                        <input
                          id="reg-fullname-input"
                          type="text"
                          required
                          value={regFullName}
                          onChange={(e) => setRegFullName(e.target.value)}
                          placeholder="Ex: Alexandre Cury Filho"
                          disabled={isProcessing}
                          className="w-full text-xs pl-9 pr-3 py-1.5 border border-neutral-300 rounded focus:border-[#406a94] focus:outline-none bg-neutral-50/55 text-neutral-800 shadow-inner"
                        />
                      </div>
                    </div>

                    {/* Username */}
                    <div className="space-y-1">
                      <label className="block text-[11px] font-black text-neutral-600 uppercase tracking-wide">
                        Nome de Usuário Único (@): *
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-neutral-400">
                          <span className="text-xs font-black font-mono">@</span>
                        </span>
                        <input
                          id="reg-username-input"
                          type="text"
                          required
                          value={regUsername}
                          onChange={(e) => setRegUsername(e.target.value)}
                          placeholder="Ex: alex_c"
                          disabled={isProcessing}
                          className="w-full text-xs pl-9 pr-3 py-1.5 border border-neutral-300 rounded focus:border-[#406a94] focus:outline-none bg-neutral-50/55 text-neutral-800 shadow-inner font-mono"
                        />
                      </div>
                    </div>

                    {/* E-mail */}
                    <div className="space-y-1">
                      <label className="block text-[11px] font-black text-neutral-600 uppercase tracking-wide">
                        E-mail de Login: *
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-neutral-400">
                          <Mail size={13} />
                        </span>
                        <input
                          id="reg-email-input"
                          type="email"
                          required
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          placeholder="seuemail@provedor.com"
                          disabled={isProcessing}
                          className="w-full text-xs pl-9 pr-3 py-1.5 border border-neutral-300 rounded focus:border-[#406a94] focus:outline-none bg-neutral-50/55 text-neutral-800 shadow-inner"
                        />
                      </div>
                    </div>

                    {/* Phone - Mandatory */}
                    <div className="space-y-1">
                      <label className="block text-[11px] font-black text-neutral-600 uppercase tracking-wide">
                        Número de Celular: *
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-neutral-400">
                          <Phone size={13} />
                        </span>
                        <input
                          id="reg-phone-input"
                          type="tel"
                          required
                          value={regPhone}
                          onChange={(e) => setRegPhone(e.target.value)}
                          placeholder="Ex: (41) 99123-4567"
                          disabled={isProcessing}
                          className="w-full text-xs pl-9 pr-3 py-1.5 border border-neutral-300 rounded focus:border-[#406a94] focus:outline-none bg-neutral-50/55 text-neutral-800 shadow-inner"
                        />
                      </div>
                    </div>

                    {/* Passwords Column Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Password */}
                      <div className="space-y-1">
                        <label className="block text-[11.5px] font-black text-neutral-600 uppercase tracking-wide">
                          Senha: *
                        </label>
                        <input
                          id="reg-password-input"
                          type="password"
                          required
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          placeholder="Mínimo 6 dígitos"
                          disabled={isProcessing}
                          className="w-full text-xs px-3 py-1.5 border border-neutral-300 rounded focus:border-[#406a94] focus:outline-none bg-neutral-50/55 text-neutral-800 shadow-inner"
                        />
                      </div>

                      {/* Confirm Password */}
                      <div className="space-y-1">
                        <label className="block text-[11.5px] font-black text-neutral-600 uppercase tracking-wide">
                          Confirme Senha: *
                        </label>
                        <input
                          id="reg-confirmpassword-input"
                          type="password"
                          required
                          value={regConfirmPassword}
                          onChange={(e) => setRegConfirmPassword(e.target.value)}
                          placeholder="Repita a senha"
                          disabled={isProcessing}
                          className="w-full text-xs px-3 py-1.5 border border-neutral-300 rounded focus:border-[#406a94] focus:outline-none bg-neutral-50/55 text-neutral-800"
                        />
                      </div>
                    </div>

                    {/* Agree terms */}
                    <div className="flex items-start gap-2 pt-1">
                      <input
                        id="reg-terms-checkbox"
                        type="checkbox"
                        required
                        checked={regAgreeTerms}
                        onChange={(e) => setRegAgreeTerms(e.target.checked)}
                        disabled={isProcessing}
                        className="h-3.5 w-3.5 border-neutral-300 rounded text-[#1b4372] focus:ring-[#406a94] mt-0.5"
                      />
                      <label htmlFor="reg-terms-checkbox" className="text-[10.5px] text-neutral-500 font-sans leading-tight">
                        Aceito os termos da comunidade e concordo que o Borrow Checker de Curitiba audite minhas interações sem vazamento de heap de memória. Sim a amizades seguras!
                      </label>
                    </div>

                    {/* Action buttons */}
                    <div className="pt-2 flex flex-col gap-2">
                      <button
                        id="reg-submit-button"
                        type="submit"
                        disabled={isProcessing}
                        className="w-full py-2 bg-[#dee7f4] hover:bg-[#c6d7ed] border border-[#adc3df] text-[#1b4372] font-black text-xs uppercase tracking-wide rounded cursor-pointer transition-all disabled:opacity-60 flex items-center justify-center gap-2 h-9"
                      >
                        {isProcessing ? (
                          <>
                            <RefreshCw className="animate-spin" size={13} />
                            <span>Processando Cadastro (1.5s)...</span>
                          </>
                        ) : (
                          <span>Cadastrar Minha Alma</span>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setErrorMessage('');
                          setSuccessMessage('');
                          setView('login');
                        }}
                        className="w-full text-center text-neutral-500 hover:text-[#1b4372] text-[11px] underline select-none"
                      >
                        Voltar à tela de Login
                      </button>
                    </div>

                  </form>
                </motion.div>
              )}

              {/* VIEW: RECOVER PASSWORD FORM */}
              {view === 'recover' && (
                <motion.div
                  key="recover-view"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.18 }}
                  className="flex flex-col flex-1"
                >
                  <div className="mb-5 text-center sm:text-left border-b border-neutral-100 pb-3">
                    <h3 className="text-lg font-black text-[#1b4372] tracking-tight font-sans">
                      Recuperação de Senha Segura
                    </h3>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Insira o seu e-mail cadastrado e enviaremos instruções
                    </p>
                  </div>

                  <form onSubmit={handleRecoverSubmit} className="space-y-5 flex-1">
                    
                    {errorMessage && (
                      <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded text-xs flex items-start gap-2 font-sans">
                        <AlertCircle size={15} className="flex-shrink-0 mt-0.5 text-rose-600" />
                        <span>{errorMessage}</span>
                      </div>
                    )}

                    {successMessage && (
                      <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded text-xs flex items-start gap-2 font-sans">
                        <CheckCircle size={15} className="flex-shrink-0 mt-0.5 text-emerald-600" />
                        <span>{successMessage}</span>
                      </div>
                    )}

                    <div className="space-y-1">
                      <label className="block text-[11px] font-black text-neutral-600 uppercase tracking-wide">
                        E-mail de Cadastro:
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-neutral-400">
                          <Mail size={13} />
                        </span>
                        <input
                          id="recover-email-input"
                          type="email"
                          required
                          value={recoverEmail}
                          onChange={(e) => setRecoverEmail(e.target.value)}
                          placeholder="Ex: seuemail@gmail.com"
                          disabled={isProcessing}
                          className="w-full text-xs pl-9 pr-3 py-2 border border-neutral-300 rounded focus:border-[#406a94] focus:outline-none bg-neutral-50/55 text-neutral-800 shadow-inner"
                        />
                      </div>
                    </div>

                    <div className="pt-2 flex flex-col gap-2">
                      <button
                        id="recover-submit-button"
                        type="submit"
                        disabled={isProcessing}
                        className="w-full py-2.5 bg-[#dee7f4] hover:bg-[#c6d7ed] border border-[#adc3df] text-[#1b4372] font-black text-xs uppercase tracking-wide rounded cursor-pointer transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                      >
                        {isProcessing ? (
                          <>
                            <RefreshCw className="animate-spin text-[#1b4372]" size={14} />
                            <span>Solicitando Chave (1.5s)...</span>
                          </>
                        ) : (
                          <span>Enviar Redefinição</span>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setErrorMessage('');
                          setSuccessMessage('');
                          setView('login');
                        }}
                        className="w-full text-center text-neutral-500 hover:text-[#1b4372] text-[11px] underline select-none mt-2"
                      >
                        Voltar à tela de Login
                      </button>
                    </div>

                  </form>
                </motion.div>
              )}

            </AnimatePresence>

          </div>

        </div>

      </div>

      {/* QUICK FLOATING SECTION: FAST DEMO CHARACTER ACCESS for easy sandboxed evaluator logins */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center w-full max-w-lg px-4 hidden sm:block pointer-events-auto">
        <div className="bg-white/80 backdrop-blur-xs border border-[#92afd9]/60 rounded-full py-1.5 px-4 inline-flex items-center gap-3 shadow-[0_2px_12px_rgba(29,67,114,0.05)]">
          <span className="text-[10px] uppercase tracking-wider text-[#1b4372] font-black font-sans flex items-center gap-1.5 select-none">
            <HelpCircle size={11} className="text-[#3b82f6]" />
            Membros padrão para teste rápido:
          </span>
          <div className="flex items-center gap-2">
            {Object.keys(defaultProfiles).map((key) => {
              const p = defaultProfiles[key];
              return (
                <button
                  id={`demo-login-${key}`}
                  key={key}
                  onClick={() => handleDemoLogin(key)}
                  disabled={isProcessing}
                  title={`Entrar rapidamente como ${p.name}`}
                  className="h-6 w-6 rounded-full overflow-hidden border border-neutral-300 hover:border-[#ed3fa7] hover:scale-110 active:scale-95 transition-all cursor-pointer box-content shadow-xs"
                >
                  <img src={p.avatar} alt={p.name} className="h-full w-full object-cover" />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* CAPTCHA ANTI-BOT SLIDER MODAL */}
      <AnimatePresence>
        {showCaptcha && (
          <OrkutCaptcha 
            onSuccess={handleCaptchaSuccess}
            onCancel={handleCaptchaCancel}
          />
        )}
      </AnimatePresence>

      {/* SMS Phone Verification Retro Modal */}
      <AnimatePresence>
        {showSmsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
          >
            <motion.div
              initial={{ y: -30, scale: 0.95 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: -30, scale: 0.95 }}
              className="max-w-md w-full bg-[#f3f7fc] border-2 border-[#1b4372] rounded shadow-2xl overflow-hidden font-sans text-left"
            >
              {/* Window Header */}
              <div className="bg-[#1b4372] px-4 py-2.5 flex items-center justify-between text-white select-none">
                <span className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                  <Phone size={13} className="text-pink-400" />
                  Verificação Obrigatória de Celular
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setShowSmsModal(false);
                    setSmsSuccessNotification(null);
                  }}
                  className="text-neutral-300 hover:text-white font-bold text-xs bg-transparent border-none cursor-pointer"
                >
                  [ Fechar ]
                </button>
              </div>

              {/* Content Panel */}
              <div className="p-5 space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded p-3 text-xs text-[#1e3a8a] leading-relaxed">
                  <span className="font-bold block mb-1">Passo Integridade e Segurança:</span>
                  Enviamos um código de segurança SMS de 6 dígitos para o número <strong className="text-black font-semibold">{regPhone}</strong>. Insira-o abaixo para concluir seu cadastro na rede.
                </div>

                {smsError && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-800 p-2.5 rounded text-xs flex items-start gap-1.5 font-sans animate-fade-in">
                    <AlertCircle size={15} className="flex-shrink-0 mt-0.5 text-rose-605" />
                    <span>{smsError}</span>
                  </div>
                )}

                <form onSubmit={handleVerifySmsAndRegister} className="space-y-4">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-black text-neutral-600 uppercase tracking-wide text-center sm:text-left">
                      Código de Verificação de SMS (6 dígitos):
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={userSmsInput}
                      onChange={(e) => setUserSmsInput(e.target.value.replace(/\D/g, ''))}
                      placeholder="Ex: 123456"
                      className="w-full text-center text-lg tracking-widest font-mono py-2 bg-white border-2 border-neutral-350 rounded focus:border-[#1b4372] focus:outline-none text-[#1b4372]"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-2 pt-1">
                    <button
                      type="submit"
                      className="w-full py-2 bg-[#ed3fa7] hover:bg-[#d6278f] active:bg-[#ba1e7a] text-white font-black text-xs uppercase tracking-wide rounded cursor-pointer transition-all flex items-center justify-center gap-1.5 border-none"
                    >
                      <span>✓ Confirmar Código & Registrar</span>
                    </button>

                    <div className="flex justify-between items-center text-xs mt-1">
                      <button
                        type="button"
                        onClick={() => sendSmsCode(regPhone)}
                        className="text-[#103056] font-bold hover:underline bg-transparent border-none cursor-pointer"
                      >
                        Reenviar SMS 🔄
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setShowSmsModal(false);
                          setSmsSuccessNotification(null);
                        }}
                        className="text-neutral-500 hover:text-neutral-700 underline bg-transparent border-none cursor-pointer"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              {/* Bottom Decorative Status Area */}
              <div className="bg-[#dee7f4] border-t border-[#b7cbdc] px-4 py-2 flex items-center justify-between text-[10px] text-neutral-600 font-sans">
                <span>Status: Aguardando Código</span>
                <span className="font-semibold text-emerald-700">Conexão Criptografada SSL</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Simulated SMS Notification Toast */}
      <AnimatePresence>
        {smsSuccessNotification && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed bottom-4 right-4 z-[9999] max-w-sm w-full bg-[#1b233a] border-2 border-blue-500 rounded-lg shadow-2xl p-4 text-white font-sans flex items-start gap-3"
            id="sms-simulation-toast"
          >
            <div className="bg-sky-500/20 p-2 rounded-full text-sky-400 mt-0.5 animate-pulse flex-shrink-0">
              <Phone size={18} className="text-sky-400" />
            </div>
            <div className="flex-1 text-left">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] uppercase font-black tracking-wider text-sky-400">Mensagem Recebida (SMS)</span>
                <button 
                  onClick={() => setSmsSuccessNotification(null)}
                  className="text-neutral-400 hover:text-white font-bold text-xs bg-transparent border-none cursor-pointer p-0"
                >
                  ×
                </button>
              </div>
              <p className="text-xs text-neutral-200 font-mono font-medium whitespace-pre-line leading-relaxed">
                {smsSuccessNotification}
              </p>
              <div className="mt-2 text-[8px] text-neutral-400 font-mono flex justify-between items-center">
                <span>Simulado • Rede Scrapzone Móvel</span>
                <span className="text-neutral-500">Agora</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
