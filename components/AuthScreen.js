import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  Alert,
  Dimensions
} from 'react-native';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  auth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  isConfigured,
  sendPasswordResetEmail,
  sendEmailVerification
} from '../firebase/firebaseConfig';
import { 
  Crown, 
  Mail, 
  Lock, 
  AlertCircle,
  Sparkles,
  User,
  Eye,
  EyeOff
} from 'lucide-react-native';

const { width } = Dimensions.get('window');
const isMobileDevice = width < 450; // Detect standard mobile phone widths

export default function AuthScreen({ onAuthSuccess }) {
  const { t, i18n } = useTranslation();
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [signUpSuccess, setSignUpSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [keepLoggedIn, setKeepLoggedIn] = useState(true);

  // Load keep logged in status from AsyncStorage
  useEffect(() => {
    const loadKeepLoggedIn = async () => {
      try {
        const saved = await AsyncStorage.getItem('lumora_keep_logged_in');
        if (saved !== null) {
          setKeepLoggedIn(saved !== 'false');
        }
      } catch (e) {
        console.error(e);
      }
    };
    loadKeepLoggedIn();
  }, []);

  const handleKeepLoggedInToggle = async () => {
    const nextVal = !keepLoggedIn;
    setKeepLoggedIn(nextVal);
    try {
      await AsyncStorage.setItem('lumora_keep_logged_in', String(nextVal));
    } catch (e) {
      console.error(e);
    }
  };

  // Validation rules
  const isLengthValid = password.length >= 6;
  const isComboValid = /[a-zA-Z]/.test(password) && /[0-9]/.test(password);

  const handleEmailAuth = async () => {
    if (!isConfigured) {
      setError(t('auth.err_no_firebase'));
      return;
    }

    if (!email || !password) {
      setError(t('auth.err_missing_fields'));
      return;
    }

    if (isSignUp && (!isLengthValid || !isComboValid)) {
      setError(t('auth.err_pwd_invalid_requirement'));
      return;
    }

    if (isSignUp && password !== confirmPassword) {
      setError(t('auth.err_pwd_mismatch'));
      return;
    }

    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        // Sign Up Flow
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        auth.languageCode = i18n.language || 'ko';
        await sendEmailVerification(userCredential.user);
        await signOut(auth);
        
        setPassword('');
        setConfirmPassword('');
        setSignUpSuccess(true);
      } else {
        // Sign In Flow
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        onAuthSuccess && onAuthSuccess(userCredential.user);
      }
    } catch (err) {
      console.error(err);
      let errMsg = t('auth.err_general');
      if (err.code === "auth/email-already-in-use") {
        errMsg = t('auth.err_email_in_use');
      } else if (err.code === "auth/invalid-email") {
        errMsg = t('auth.err_invalid_email');
      } else if (err.code === "auth/weak-password") {
        errMsg = t('auth.err_weak_pwd');
      } else if (err.code === "auth/missing-password" || err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        errMsg = t('auth.err_wrong_credentials');
      } else if (err.code === "auth/user-not-found") {
        errMsg = t('auth.err_user_not_found');
      } else if (err.code === "auth/operation-not-allowed") {
        errMsg = t('auth.err_operation_not_allowed');
      } else if (err.code === "auth/too-many-requests") {
        errMsg = t('auth.err_too_many_requests');
      } else if (err.code === "auth/user-disabled") {
        errMsg = t('auth.err_user_disabled');
      } else if (err.code === "auth/network-request-failed") {
        errMsg = t('auth.err_network');
      } else if (err.code) {
        errMsg = `${t('auth.err_general')} (${err.code})`;
      }
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!isConfigured) {
      setError(t('auth.err_no_firebase'));
      return;
    }

    if (!email) {
      setError(t('auth.err_enter_email_for_reset'));
      return;
    }

    setError('');
    setLoading(true);
    try {
      auth.languageCode = i18n.language || 'ko';
      await sendPasswordResetEmail(auth, email);
      Alert.alert(
        t('auth.forgot_pwd') || '비밀번호 찾기',
        t('auth.pwd_reset_sent'),
        [{ text: t('app.confirm') || '확인', onPress: () => setIsForgotPassword(false) }]
      );
    } catch (err) {
      console.error(err);
      let errMsg = t('auth.err_general');
      if (err.code === "auth/invalid-email") {
        errMsg = t('auth.err_invalid_email');
      } else if (err.code === "auth/user-not-found") {
        errMsg = t('auth.err_user_not_found');
      } else if (err.code === "auth/network-request-failed") {
        errMsg = t('auth.err_network');
      } else if (err.code) {
        errMsg = `${t('auth.err_general')} (${err.code})`;
      }
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = () => {
    console.log("Entering guest mode");
    onAuthSuccess && onAuthSuccess({ uid: "guest_user", email: "guest@codetiara.com" });
  };

  return (
    <View style={[styles.container, isMobileDevice ? styles.mobileContainer : styles.desktopContainer]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1, width: '100%', alignItems: 'center' }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {/* Main Content Area */}
          <View style={[
            styles.card,
            isMobileDevice && styles.mobileCard
          ]}>
            {signUpSuccess ? (
              // 1. SignUp Success Screen
              <View style={styles.stateContainer}>
                <View style={styles.logoBadge}>
                  <Sparkles size={32} color="#FFFFFF" />
                </View>
                <Text style={styles.titleText}>
                  {t('auth.signup_complete_title')}
                </Text>
                <Text style={styles.subtitleText}>
                  {t('auth.signup_complete_desc')}
                </Text>

                <TouchableOpacity 
                  style={styles.primaryButton} 
                  onPress={() => {
                    setSignUpSuccess(false);
                    setIsSignUp(false);
                  }}
                >
                  <Text style={styles.primaryBtnText}>
                    {t('auth.go_to_login')}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : isForgotPassword ? (
              // 2. Forgot Password Screen
              <View style={styles.stateContainer}>
                <View style={styles.logoBadge}>
                  <Lock size={30} color="#FFFFFF" />
                </View>
                <Text style={styles.titleText}>
                  {t('auth.forgot_pwd')}
                </Text>
                <Text style={styles.subtitleText}>
                  {t('auth.pwd_reset_subtitle')}
                </Text>

                {error ? (
                  <View style={styles.errorContainer}>
                    <AlertCircle size={16} color="#EF4444" style={{ marginRight: 6 }} />
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                ) : null}

                <View style={styles.inputWrapper}>
                  <Mail size={18} color="#9CA3AF" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder={t('auth.email_placeholder')}
                    placeholderTextColor="#9CA3AF"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={!loading}
                  />
                </View>

                <TouchableOpacity 
                  style={styles.primaryButton} 
                  onPress={handleForgotPassword}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.primaryBtnText}>{t('auth.send_reset_link')}</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={() => { setIsForgotPassword(false); setError(''); }}
                  style={styles.linkContainer}
                >
                  <Text style={styles.linkText}>
                    {t('auth.back_to_login')}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              // 3. Login / Sign Up Main View
              <View style={styles.stateContainer}>
                <View style={styles.logoRow}>
                  <View style={styles.miniLogoBadge}>
                    <Crown size={22} color="#FFFFFF" />
                  </View>
                  <Text style={styles.brandText}>
                    Code Tiara
                  </Text>
                </View>

                <Text style={styles.titleText}>
                  {isSignUp ? t('auth.signup') : t('auth.login')}
                </Text>
                <Text style={styles.subtitleText}>
                  {isSignUp ? t('auth.subtitle_signup') : t('auth.subtitle_login')}
                </Text>

                {error ? (
                  <View style={styles.errorContainer}>
                    <AlertCircle size={16} color="#EF4444" style={{ marginRight: 6 }} />
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                ) : null}

                <View style={styles.formContainer}>
                  {/* Email Input */}
                  <View style={styles.inputWrapper}>
                    <Mail size={18} color="#9CA3AF" style={styles.inputIcon} />
                    <TextInput
                      style={styles.textInput}
                      placeholder={t('auth.email_placeholder')}
                      placeholderTextColor="#9CA3AF"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      editable={!loading}
                    />
                  </View>

                  {/* Password Input */}
                  <View style={styles.inputWrapper}>
                    <Lock size={18} color="#9CA3AF" style={styles.inputIcon} />
                    <TextInput
                      style={styles.textInput}
                      placeholder={t('auth.pwd_placeholder')}
                      placeholderTextColor="#9CA3AF"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      editable={!loading}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                      {showPassword ? <EyeOff size={18} color="#9CA3AF" /> : <Eye size={18} color="#9CA3AF" />}
                    </TouchableOpacity>
                  </View>

                  {/* Password Requirement Labels (Sign Up) */}
                  {isSignUp && (
                    <View style={styles.reqsWrapper}>
                      <Text style={[styles.reqText, isLengthValid ? { color: '#059669', fontWeight: 'bold' } : { color: '#9CA3AF' }]}>
                        {isLengthValid ? '● ' : '○ '}
                        {t('auth.pwd_req_length')}
                      </Text>
                      <Text style={[styles.reqText, isComboValid ? { color: '#059669', fontWeight: 'bold' } : { color: '#9CA3AF' }]}>
                        {isComboValid ? '● ' : '○ '}
                        {t('auth.pwd_req_combo')}
                      </Text>
                    </View>
                  )}

                  {/* Confirm Password (Sign Up) */}
                  {isSignUp && (
                    <View style={styles.inputWrapper}>
                      <Lock size={18} color="#9CA3AF" style={styles.inputIcon} />
                      <TextInput
                        style={styles.textInput}
                        placeholder={t('auth.pwd_confirm_placeholder')}
                        placeholderTextColor="#9CA3AF"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry={!showConfirmPassword}
                        autoCapitalize="none"
                        editable={!loading}
                      />
                      <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
                        {showConfirmPassword ? <EyeOff size={18} color="#9CA3AF" /> : <Eye size={18} color="#9CA3AF" />}
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* Keep Logged In Checkbox & Forgot Password */}
                  {!isSignUp && (
                    <View style={styles.optionRow}>
                      <TouchableOpacity 
                        style={styles.checkboxWrapper} 
                        onPress={handleKeepLoggedInToggle}
                      >
                        <View style={[
                          styles.checkbox,
                          keepLoggedIn && styles.checkboxChecked
                        ]}>
                          {keepLoggedIn && <Text style={styles.checkboxTick}>✓</Text>}
                        </View>
                        <Text style={styles.optionText}>
                          {t('auth.keep_logged_in')}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity onPress={() => { setIsForgotPassword(true); setError(''); }}>
                        <Text style={styles.forgotText}>
                          {t('auth.forgot_pwd')}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* Primary Submit Button */}
                  <TouchableOpacity 
                    style={styles.primaryButton} 
                    onPress={handleEmailAuth}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.primaryBtnText}>
                        {isSignUp ? t('auth.signup') : t('auth.login')}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>

                {/* Divider */}
                <View style={styles.dividerRow}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>
                    {t('auth.or_easy_login')}
                  </Text>
                  <View style={styles.dividerLine} />
                </View>

                {/* Guest Entry Button */}
                <View style={styles.guestAccessRow}>
                  <TouchableOpacity 
                    style={styles.guestButton} 
                    onPress={handleGuestLogin}
                  >
                    <User size={18} color="#111827" />
                    <Text style={styles.guestText}>
                      {t('auth.guest_mode')}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Footer Switch Login/Signup */}
                <View style={styles.footerRow}>
                  {isSignUp ? (
                    <Text style={styles.footerText}>
                      {t('auth.already_have_account')}
                      <Text 
                        style={styles.footerLink}
                        onPress={() => setIsSignUp(false)}
                      >
                        {' '}{t('auth.login')}
                      </Text>
                    </Text>
                  ) : (
                    <Text style={styles.footerText}>
                      {t('auth.no_account')}
                      <Text 
                        style={styles.footerLink}
                        onPress={() => setIsSignUp(true)}
                      >
                        {' '}{t('auth.signup')}
                      </Text>
                    </Text>
                  )}
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  mobileContainer: {
    backgroundColor: '#FFFFFF',
  },
  desktopContainer: {
    backgroundColor: '#F3F4F6',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
    width: '100%',
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 40,
    paddingVertical: 36,
    paddingHorizontal: 28,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.05,
    shadowRadius: 25,
    elevation: 8,
  },
  mobileCard: {
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  stateContainer: {
    width: '100%',
    alignItems: 'center',
  },
  logoBadge: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: '#1E1E1E',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    transform: [{ rotate: '-6deg' }],
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  miniLogoBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#111827',
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '-6deg' }],
    marginRight: 10,
  },
  brandText: {
    fontSize: 16,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: '#111827',
  },
  titleText: {
    fontSize: 26,
    fontWeight: '800',
    color: '#000000',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitleText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 28,
  },
  errorContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    marginBottom: 20,
  },
  errorText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#EF4444',
    flex: 1,
  },
  formContainer: {
    width: '100%',
    gap: 14,
  },
  inputWrapper: {
    width: '100%',
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#F2F2F2',
    borderRadius: 20,
    marginBottom: 10,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  eyeIcon: {
    padding: 4,
  },
  reqsWrapper: {
    paddingHorizontal: 8,
    marginBottom: 6,
  },
  reqText: {
    fontSize: 11,
    marginBottom: 2,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
    marginBottom: 12,
  },
  checkboxWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 16,
    height: 16,
    borderWidth: 1.5,
    borderColor: '#9CA3AF',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  checkboxChecked: {
    borderColor: '#000000',
    backgroundColor: '#000000',
  },
  checkboxTick: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: 'bold',
  },
  optionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#4B5563',
  },
  forgotText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#EF4444',
  },
  primaryButton: {
    width: '100%',
    height: 52,
    backgroundColor: '#000000',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 3,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: 12,
  },
  guestAccessRow: {
    width: '100%',
    marginBottom: 20,
  },
  guestButton: {
    width: '100%',
    height: 48,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 24,
    gap: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  guestText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  footerRow: {
    marginTop: 12,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#4B5563',
  },
  footerLink: {
    fontWeight: 'bold',
    color: '#EF4444',
  },
  linkContainer: {
    marginTop: 18,
    padding: 6,
  },
  linkText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000000',
    textDecorationLine: 'underline',
  },
  headerControls: {
    display: 'none', // Remove completely from the layout as per user request
  }
});
