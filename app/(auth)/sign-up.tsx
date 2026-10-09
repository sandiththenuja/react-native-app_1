import { useSignUp } from "@clerk/expo";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { Platform, Pressable, Text, View } from "react-native";
import AuthScreen from "@/components/auth/AuthScreen";
import AuthSubmitButton from "@/components/auth/AuthSubmitButton";
import AuthTextField from "@/components/auth/AuthTextField";
import {
  getAuthErrorMessage,
  isValidEmail,
  isValidPassword,
  isValidVerificationCode,
} from "@/lib/auth-validation";

type SignUpStep = "details" | "verify" | "finish";

export default function SignUp() {
  const { signUp, errors, fetchStatus } = useSignUp();
  const router = useRouter();
  const [step, setStep] = useState<SignUpStep>("details");
  const [username, setUsername] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [code, setCode] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isPending = isSubmitting || fetchStatus === "fetching";

  async function finishSignUp() {
    const { error } = await signUp.finalize();
    if (error) {
      setStep("finish");
      setFormError(
        getAuthErrorMessage(error, "We couldn't finish creating your account. Please try again."),
      );
      return;
    }

    router.replace("/(tabs)");
  }

  async function handleCreateAccount() {
    const nextErrors: Record<string, string> = {};
    if (!username.trim()) {
      nextErrors.username = "Choose a username.";
    }
    if (!isValidEmail(emailAddress)) {
      nextErrors.emailAddress = "Enter a valid email address.";
    }
    if (!isValidPassword(password)) {
      nextErrors.password = "Use at least 8 characters for your password.";
    }
    if (confirmPassword !== password) {
      nextErrors.confirmPassword = "Your passwords don't match.";
    }

    setFieldErrors(nextErrors);
    setFormError(null);
    setNotice(null);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      const { error } = await signUp.password({
        username: username.trim(),
        emailAddress: emailAddress.trim(),
        password,
      });
      if (error) {
        setFormError(getAuthErrorMessage(error, "We couldn't create your account."));
        return;
      }

      if (signUp.status === "complete") {
        await finishSignUp();
        return;
      }

      const { error: sendCodeError } =
        await signUp.verifications.sendEmailCode();
      if (sendCodeError) {
        setFormError(
          getAuthErrorMessage(
            sendCodeError,
            "We couldn't send your verification code. Please try again.",
          ),
        );
        return;
      }

      setCode("");
      setStep("verify");
      setNotice(`We sent a verification code to ${emailAddress.trim()}.`);
    } catch (error) {
      setFormError(
        getAuthErrorMessage(
          error,
          "We couldn't create your account. Check your connection and try again.",
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleVerifyEmail() {
    const trimmedCode = code.trim();
    if (!isValidVerificationCode(trimmedCode)) {
      setFieldErrors({ code: "Enter the verification code from your email." });
      return;
    }

    setFieldErrors({});
    setFormError(null);
    setNotice(null);
    setIsSubmitting(true);
    try {
      const { error } = await signUp.verifications.verifyEmailCode({
        code: trimmedCode,
      });
      if (error) {
        setFormError(
          getAuthErrorMessage(
            error,
            "That code couldn't be verified. Check it and try again.",
          ),
        );
        return;
      }

      if (signUp.status !== "complete") {
        setFormError(
          "Your email is verified, but your account needs additional information. Please contact support.",
        );
        console.log("SignUp Status:", signUp.status);
        console.log("Missing Fields:", signUp.missingFields);
        console.log("Unverified Fields:", signUp.unverifiedFields);
        return;
      }

      await finishSignUp();
    } catch (error) {
      setFormError(
        getAuthErrorMessage(
          error,
          "We couldn't verify your email. Check your connection and try again.",
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResendCode() {
    setFormError(null);
    setNotice(null);
    setIsSubmitting(true);
    try {
      const { error } = await signUp.verifications.sendEmailCode();
      if (error) {
        setFormError(
          getAuthErrorMessage(
            error,
            "We couldn't send a new code. Please try again.",
          ),
        );
        return;
      }
      setNotice(`A new code was sent to ${emailAddress.trim()}.`);
    } catch (error) {
      setFormError(
        getAuthErrorMessage(
          error,
          "We couldn't send a new code. Check your connection and try again.",
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const titleByStep: Record<SignUpStep, string> = {
    details: "Create your account",
    verify: "Check your email",
    finish: "Almost there",
  };
  const subtitleByStep: Record<SignUpStep, string> = {
    details: "Get a clearer picture of your subscriptions and recurring spend.",
    verify:
      "Enter the code we sent to confirm your email and finish setting up your account.",
    finish: "Your email is verified. Finish setting up your secure account.",
  };

  return (
    <AuthScreen
      title={titleByStep[step]}
      subtitle={subtitleByStep[step]}
      footer={
        <>
          <Text className="auth-link-copy">Already have an account?</Text>
          <Link href="/(auth)/sign-in">
            <Text className="auth-link">Sign in</Text>
          </Link>
        </>
      }
    >
      {step === "details" ? (
        <View className="auth-form">
          <AuthTextField
            label="Username"
            value={username}
            editable={!isPending}
            onChangeText={(value) => {
              setUsername(value);
              setFieldErrors((current) => ({ ...current, username: "" }));
              setFormError(null);
            }}
            placeholder="Choose a username"
            textContentType="username"
            autoComplete="username-new"
            returnKeyType="next"
            error={
              fieldErrors.username ?? errors.fields.username?.message
            }
            accessibilityHint="Choose the username you'd like to use for your account."
          />
          <AuthTextField
            label="Email address"
            value={emailAddress}
            editable={!isPending}
            onChangeText={(value) => {
              setEmailAddress(value);
              setFieldErrors((current) => ({
                ...current,
                emailAddress: "",
              }));
              setFormError(null);
            }}
            placeholder="you@example.com"
            keyboardType="email-address"
            textContentType="emailAddress"
            autoComplete="email"
            returnKeyType="next"
            error={
              fieldErrors.emailAddress ??
              errors.fields.emailAddress?.message
            }
          />
          <AuthTextField
            label="Password"
            value={password}
            editable={!isPending}
            onChangeText={(value) => {
              setPassword(value);
              setFieldErrors((current) => ({ ...current, password: "" }));
              setFormError(null);
            }}
            placeholder="At least 8 characters"
            textContentType="newPassword"
            autoComplete="new-password"
            secureEntry
            error={fieldErrors.password ?? errors.fields.password?.message}
            accessibilityHint="Use at least 8 characters."
          />
          <AuthTextField
            label="Confirm password"
            value={confirmPassword}
            editable={!isPending}
            onChangeText={(value) => {
              setConfirmPassword(value);
              setFieldErrors((current) => ({
                ...current,
                confirmPassword: "",
              }));
              setFormError(null);
            }}
            placeholder="Re-enter your password"
            textContentType="newPassword"
            autoComplete="new-password"
            secureEntry
            returnKeyType="done"
            onSubmitEditing={handleCreateAccount}
            error={fieldErrors.confirmPassword}
          />

          {formError ? (
            <Text className="auth-error" accessibilityLiveRegion="polite">
              {formError}
            </Text>
          ) : null}

          {Platform.OS === "web" ? (
            <View
              nativeID="clerk-captcha"
              className="auth-captcha-slot"
              style={{ minHeight: 1 }}
            />
          ) : null}

          <AuthSubmitButton
            title="Create account"
            pending={isPending}
            onPress={handleCreateAccount}
          />
        </View>
      ) : step === "verify" ? (
        <View className="auth-form">
          <Text className="auth-helper text-center">
            Verification code sent to{" "}
            <Text className="font-sans-bold text-primary">
              {emailAddress.trim()}
            </Text>
          </Text>
          <AuthTextField
            label="Verification code"
            value={code}
            editable={!isPending}
            onChangeText={(value) => {
              setCode(value);
              setFieldErrors((current) => ({ ...current, code: "" }));
              setFormError(null);
              setNotice(null);
            }}
            placeholder="Enter the code"
            keyboardType="number-pad"
            textContentType="oneTimeCode"
            autoComplete="one-time-code"
            returnKeyType="done"
            onSubmitEditing={handleVerifyEmail}
            maxLength={10}
            error={fieldErrors.code ?? errors.fields.code?.message}
          />

          {formError ? (
            <Text className="auth-error" accessibilityLiveRegion="polite">
              {formError}
            </Text>
          ) : null}
          {notice ? (
            <Text className="auth-helper" accessibilityLiveRegion="polite">
              {notice}
            </Text>
          ) : null}

          <AuthSubmitButton
            title="Verify email"
            pending={isPending}
            onPress={handleVerifyEmail}
          />
          <Pressable
            accessibilityRole="button"
            className="items-center py-2"
            disabled={isPending}
            onPress={handleResendCode}
          >
            <Text className="auth-link">Resend code</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            className="items-center py-2"
            disabled={isPending}
            onPress={() => {
              setStep("details");
              setCode("");
              setFormError(null);
              setNotice(null);
            }}
          >
            <Text className="auth-link-copy">Use a different email</Text>
          </Pressable>
        </View>
      ) : (
        <View className="auth-form">
          {formError ? (
            <Text className="auth-error" accessibilityLiveRegion="polite">
              {formError}
            </Text>
          ) : null}
          <AuthSubmitButton
            title="Continue"
            pending={isPending}
            onPress={finishSignUp}
          />
        </View>
      )}
    </AuthScreen>
  );
}
