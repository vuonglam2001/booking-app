import React, { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';

import { Button } from '@/components/ui/button';
import { ThemeColors } from '@/constants/theme';
import { Spacing } from '@/constants/spacing';
import { Typography } from '@/constants/typography';
import { strings } from '@/constants/i18n';
import { useAppMode } from '@/hooks/use-app-mode';
import { useAuth } from '@/hooks/use-auth';

export default function LoginScreen() {
  const { mode } = useAppMode();
  const colors = ThemeColors[mode];
  const { login } = useAuth();

  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const otpTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (otpTimerRef.current) {
        clearTimeout(otpTimerRef.current);
      }
    };
  }, []);

  const handleSendCode = () => {
    if (!email.trim() || !email.includes('@')) return;
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setStep(2);
      // Auto-fill OTP after 1.5s mock delay
      otpTimerRef.current = setTimeout(() => {
        setOtp('123456');
      }, 1500);
    }, 800);
  };

  const handleVerify = () => {
    if (otp.length !== 6) return;
    setIsVerifying(true);
    setTimeout(() => {
      const userName = email.split('@')[0];
      login({
        id: 'u1',
        name: userName,
        email,
      });
      setIsVerifying(false);
      router.back();
    }, 500);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.content}>
        {step === 1 ? (
          <>
            <Text style={[Typography.h2, { color: colors.text }]}>
              {strings.auth.title}
            </Text>
            <TextInput
              style={[
                styles.input,
                Typography.body,
                {
                  backgroundColor: colors.inputBackground,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              value={email}
              onChangeText={setEmail}
              placeholder={strings.auth.emailPlaceholder}
              placeholderTextColor={colors.inputPlaceholder}
              autoCapitalize="none"
              keyboardType="email-address"
              textContentType="emailAddress"
              autoFocus
            />
            <Button
              title={strings.auth.sendCode}
              onPress={handleSendCode}
              fullWidth
              loading={isSending}
              disabled={!email.trim() || !email.includes('@')}
            />
          </>
        ) : (
          <>
            <Text style={[Typography.h2, { color: colors.text }]}>
              {strings.auth.otpTitle}
            </Text>
            <Text
              style={[
                Typography.bodySm,
                {
                  color: colors.textSecondary,
                  marginTop: Spacing.sm,
                  marginBottom: Spacing.lg,
                },
              ]}>
              {strings.auth.otpSubtitle}
            </Text>
            <TextInput
              style={[
                styles.otpInput,
                Typography.h2,
                {
                  backgroundColor: colors.inputBackground,
                  color: colors.text,
                  borderColor: colors.borderFocused,
                },
              ]}
              value={otp}
              onChangeText={(text) => setOtp(text.replace(/[^0-9]/g, '').slice(0, 6))}
              placeholder="------"
              placeholderTextColor={colors.inputPlaceholder}
              keyboardType="number-pad"
              maxLength={6}
              textContentType="oneTimeCode"
              autoFocus
            />
            <Text
              style={[
                Typography.caption,
                {
                  color: colors.textTertiary,
                  textAlign: 'center',
                  marginBottom: Spacing.lg,
                },
              ]}>
              Sent to {email}
            </Text>
            <Button
              title={strings.auth.verify}
              onPress={handleVerify}
              fullWidth
              loading={isVerifying}
              disabled={otp.length !== 6}
            />
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md - 2,
    marginTop: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  otpInput: {
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    textAlign: 'center',
    letterSpacing: 8,
    marginBottom: Spacing.sm,
  },
});
