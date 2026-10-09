import { useSignIn } from "@clerk/expo";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import AuthScreen from "@/components/auth/AuthScreen";
import AuthSubmitButton from "@/components/auth/AuthSubmitButton";
import AuthTextField from "@/components/auth/AuthTextField";
import {
  getAuthErrorMessage,
  isAccountNotFoundError,
  isValidEmail,
  isValidPassword,
  isValidVerificationCode,
} from "@/lib/auth-validation";

type SignInStep =
  | "password"
  | "verify"
  | "reset-email"
  | "reset-code"
  | "reset-password"
  | "finish";

export default function SignIn() {
  const { signIn, errors, fetchStatus } = useSignIn();
  const router = useRouter();
  const [step, setStep] = useState<SignInStep>("password");
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isPending = isSubmitting || fetchStatus === "fetching";

  async function finishSignIn() {
    const { error } = await signIn.finalize();
    if (error) {
      setStep("finish");
      setFormError(
        getAuthErrorMessage(error, "We couldn't finish signing you in. Please try again."),
      );
      return;
    }

    router.replace("/(tabs)");
  }

  async function handlePasswordSignIn() {
    const nextErrors: Record<string, string> = {};
    if (!isValidEmail(emailAddress)) {
      nextErrors.emailAddress = "Enter a valid email address.";
    }
    if (!password) {
      nextErrors.password = "Enter your password.";
    }

    setFieldErrors(nextErrors);
    setFormError(null);
    setNotice(null);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      const { error } = await signIn.password({
        identifier: emailAddress.trim(),
        password,
      });
      if (error) {
        setFormError(getAuthErrorMessage(error, "We couldn't sign you in."));
        return;
      }

      if (signIn.status === "complete") {
        await finishSignIn();
        return;
      }

      if (signIn.status === "needs_client_trust") {
        const canVerifyByEmail = signIn.supportedSecondFactors.some(
          (factor) => factor.strategy === "email_code",
        );
        if (!canVerifyByEmail) {
          setFormError(
            "This sign-in needs another verification method. Please contact support.",
          );
          return;
        }

        const { error: sendCodeError } = await signIn.mfa.sendEmailCode();
        if (sendCodeError) {
          setFormError(
            getAuthErrorMessage(
              sendCodeError,
              "We couldn't send a sign-in code. Please try again.",
            ),
          );
          return;
        }

        setCode("");
        setStep("verify");
        setNotice(`We sent a sign-in code to ${emailAddress.trim()}.`);
        return;
      }

      if (signIn.status === "needs_second_factor") {
        setFormError(
          "This account requires a second verification method not available on this screen. Please contact support.",
        );
        return;
      }

      setFormError("We couldn't complete sign-in. Please check your details and try again.");
    } catch (error) {
      setFormError(
        getAuthErrorMessage(
          error,
          "We couldn't sign you in. Check your connection and try again.",
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleVerifySignIn() {
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
      const { error } = await signIn.mfa.verifyEmailCode({
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

      if (signIn.status !== "complete") {
        setFormError("We couldn't complete sign-in with that code. Please try again.");
        return;
      }

      await finishSignIn();
    } catch (error) {
      setFormError(
        getAuthErrorMessage(
          error,
          "We couldn't verify your sign-in. Check your connection and try again.",
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResendSignInCode() {
    setFormError(null);
    setNotice(null);
    setIsSubmitting(true);
    try {
      const { error } = await signIn.mfa.sendEmailCode();
      if (error) {
        setFormError(
          getAuthErrorMessage(
            error,
            "We couldn't send a new code. Please try again.",
          ),
        );
        return;
      }
      setNotice(`A new sign-in code was sent to ${emailAddress.trim()}.`);
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

  async function handleSendResetCode() {
    if (!isValidEmail(emailAddress)) {
      setFieldErrors({ emailAddress: "Enter a valid email address." });
      return;
    }

    setFieldErrors({});
    setFormError(null);
    setNotice(null);
    setIsSubmitting(true);
    try {
      const { error: createError } = await signIn.create({
        identifier: emailAddress.trim(),
      });
      if (createError) {
        if (isAccountNotFoundError(createError)) {
          setCode("");
          setStep("reset-code");
          setNotice(
            "If an account matches this email, we've sent a password reset code.",
          );
          return;
        }
        setFormError(
          getAuthErrorMessage(
            createError,
            "We couldn't start password recovery. Please try again.",
          ),
        );
        return;
      }

      const { error: sendCodeError } =
        await signIn.resetPasswordEmailCode.sendCode();
      if (sendCodeError) {
        if (isAccountNotFoundError(sendCodeError)) {
          setCode("");
          setStep("reset-code");
          setNotice(
            "If an account matches this email, we've sent a password reset code.",
          );
          return;
        }
        setFormError(
          getAuthErrorMessage(
            sendCodeError,
            "We couldn't send a reset code. Please try again.",
          ),
        );
        return;
      }

      setCode("");
      setStep("reset-code");
      setNotice(
        "If an account matches this email, a reset code is on its way.",
      );
    } catch (error) {
      setFormError(
        getAuthErrorMessage(
          error,
          "We couldn't start password recovery. Check your connection and try again.",
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleVerifyResetCode() {
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
      const { error } = await signIn.resetPasswordEmailCode.verifyCode({
        code: trimmedCode,
      });
      if (error) {
        setFormError(
          getAuthErrorMessage(
            error,
            "That reset code couldn't be verified. Check it and try again.",
          ),
        );
        return;
      }
      setStep("reset-password");
    } catch (error) {
      setFormError(
        getAuthErrorMessage(
          error,
          "We couldn't verify the reset code. Check your connection and try again.",
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSetNewPassword() {
    const nextErrors: Record<string, string> = {};
    if (!isValidPassword(newPassword)) {
      nextErrors.newPassword = "Use at least 8 characters for your password.";
    }
    if (confirmPassword !== newPassword) {
      nextErrors.confirmPassword = "Your passwords don't match.";
    }

    setFieldErrors(nextErrors);
    setFormError(null);
    setNotice(null);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      const { error } = await signIn.resetPasswordEmailCode.submitPassword({
        password: newPassword,
      });
      if (error) {
        setFormError(
          getAuthErrorMessage(
            error,
            "We couldn't update your password. Please try again.",
          ),
        );
        return;
      }

      if (signIn.status !== "complete") {
        setFormError("Your password was updated, but we couldn't finish sign-in. Please sign in again.");
        setStep("password");
        return;
      }

      await finishSignIn();
    } catch (error) {
      setFormError(
        getAuthErrorMessage(
          error,
          "We couldn't update your password. Check your connection and try again.",
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResendResetCode() {
    setFormError(null);
    setNotice(null);
    setIsSubmitting(true);
    try {
      const { error } = await signIn.resetPasswordEmailCode.sendCode();
      if (error) {
        setFormError(
          getAuthErrorMessage(
            error,
            "We couldn't send a new reset code. Please try again.",
          ),
        );
        return;
      }
      setNotice(`A new reset code was sent to ${emailAddress.trim()}.`);
    } catch (error) {
      setFormError(
        getAuthErrorMessage(
          error,
          "We couldn't send a new reset code. Check your connection and try again.",
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function returnToSignIn() {
    void signIn.reset();
    setStep("password");
    setCode("");
    setNewPassword("");
    setConfirmPassword("");
    setFieldErrors({});
    setFormError(null);
    setNotice(null);
  }

  const titleByStep: Record<SignInStep, string> = {
    password: "Welcome back",
    verify: "Check your email",
    "reset-email": "Reset your password",
    "reset-code": "Check your email",
    "reset-password": "Choose a new password",
    finish: "Almost there",
  };
  const subtitleByStep: Record<SignInStep, string> = {
    password: "Sign in to keep your subscriptions organized and your spending in view.",
    verify: "Enter the code we sent to confirm it's really you.",
    "reset-email": "Enter the email address on your account and we'll send a reset code.",
    "reset-code": "Enter the password reset code we sent to your email.",
    "reset-password": "Choose a new password to secure your account.",
    finish: "Your account is verified. Finish signing in securely.",
  };
  const footer =
    step === "password" ? (
      <>
        <Text className="auth-link-copy">New here?</Text>
        <Link href="/(auth)/sign-up">
          <Text className="auth-link">Create an account</Text>
        </Link>
      </>
    ) : (
      <Pressable
        accessibilityRole="button"
        className="items-center"
        disabled={isPending}
        onPress={returnToSignIn}
      >
        <Text className="auth-link">Back to sign in</Text>
      </Pressable>
    );

  return (
    <AuthScreen
      title={titleByStep[step]}
      subtitle={subtitleByStep[step]}
      footer={footer}
    >
      {step === "password" || step === "reset-email" ? (
        <View className="auth-form">
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
            returnKeyType={step === "password" ? "next" : "done"}
            onSubmitEditing={
              step === "reset-email" ? handleSendResetCode : undefined
            }
            error={
              fieldErrors.emailAddress ??
              errors.fields.identifier?.message
            }
          />

          {step === "password" ? (
            <>
              <AuthTextField
                label="Password"
                value={password}
                editable={!isPending}
                onChangeText={(value) => {
                  setPassword(value);
                  setFieldErrors((current) => ({
                    ...current,
                    password: "",
                  }));
                  setFormError(null);
                }}
                placeholder="Enter your password"
                textContentType="password"
                autoComplete="current-password"
                secureEntry
                returnKeyType="done"
                onSubmitEditing={handlePasswordSignIn}
                error={
                  fieldErrors.password ?? errors.fields.password?.message
                }
              />
              <Pressable
                accessibilityRole="button"
                className="self-end py-1"
                disabled={isPending}
                onPress={() => {
                  void signIn.reset();
                  setStep("reset-email");
                  setFieldErrors({});
                  setFormError(null);
                  setNotice(null);
                }}
              >
                <Text className="auth-link">Forgot password?</Text>
              </Pressable>
            </>
          ) : null}

          {formError ? (
            <Text className="auth-error" accessibilityLiveRegion="polite">
              {formError}
            </Text>
          ) : null}

          <AuthSubmitButton
            title={step === "password" ? "Sign in" : "Send reset code"}
            pending={isPending}
            onPress={
              step === "password"
                ? handlePasswordSignIn
                : handleSendResetCode
            }
          />
        </View>
      ) : null}

      {step === "verify" || step === "reset-code" ? (
        <View className="auth-form">
          <Text className="auth-helper text-center">
            Code sent to{" "}
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
            onSubmitEditing={
              step === "verify" ? handleVerifySignIn : handleVerifyResetCode
            }
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
            title={step === "verify" ? "Verify and sign in" : "Verify code"}
            pending={isPending}
            onPress={
              step === "verify" ? handleVerifySignIn : handleVerifyResetCode
            }
          />
          <Pressable
            accessibilityRole="button"
            className="items-center py-2"
            disabled={isPending}
            onPress={
              step === "verify"
                ? handleResendSignInCode
                : handleResendResetCode
            }
          >
            <Text className="auth-link">Resend code</Text>
          </Pressable>
        </View>
      ) : null}

      {step === "reset-password" ? (
        <View className="auth-form">
          <AuthTextField
            label="New password"
            value={newPassword}
            editable={!isPending}
            onChangeText={(value) => {
              setNewPassword(value);
              setFieldErrors((current) => ({
                ...current,
                newPassword: "",
              }));
              setFormError(null);
            }}
            placeholder="At least 8 characters"
            textContentType="newPassword"
            autoComplete="new-password"
            secureEntry
            error={
              fieldErrors.newPassword ?? errors.fields.password?.message
            }
          />
          <AuthTextField
            label="Confirm new password"
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
            placeholder="Re-enter your new password"
            textContentType="newPassword"
            autoComplete="new-password"
            secureEntry
            returnKeyType="done"
            onSubmitEditing={handleSetNewPassword}
            error={fieldErrors.confirmPassword}
          />

          {formError ? (
            <Text className="auth-error" accessibilityLiveRegion="polite">
              {formError}
            </Text>
          ) : null}

          <AuthSubmitButton
            title="Save new password"
            pending={isPending}
            onPress={handleSetNewPassword}
          />
        </View>
      ) : null}

      {step === "finish" ? (
        <View className="auth-form">
          {formError ? (
            <Text className="auth-error" accessibilityLiveRegion="polite">
              {formError}
            </Text>
          ) : null}
          <AuthSubmitButton
            title="Continue"
            pending={isPending}
            onPress={finishSignIn}
          />
        </View>
      ) : null}

      {step === "reset-email" || step === "reset-code" ? (
        <Text className="auth-helper text-center">
          If an account matches this email, we&apos;ll send a password reset code.
        </Text>
      ) : null}
    </AuthScreen>
  );
}
