'use client'

import { useState } from 'react'
import { Auth as SupabaseAuth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '@/lib/supabase'
import { useSupabase } from '@/components/providers/SupabaseProvider'
import { Dashboard } from '@/components/dashboard/Dashboard'

export function Auth() {
  const { user } = useSupabase()
  const [loading, setLoading] = useState(false)

  if (user) {
    return <Dashboard />
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 lg:p-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <span className="text-white font-bold text-2xl">D</span>
        </div>
        <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">
          Добро пожаловать в Dvenki
        </h2>
        <p className="text-gray-600 text-sm lg:text-base leading-relaxed max-w-sm mx-auto">
          Войдите или зарегистрируйтесь, чтобы начать создавать свои личные журналы
        </p>
      </div>

      <div className="space-y-4">
        <SupabaseAuth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#f2751a',
                  brandAccent: '#e35a0f',
                  brandButtonText: '#ffffff',
                  defaultButtonBackground: '#f3f4f6',
                  defaultButtonBackgroundHover: '#e5e7eb',
                  defaultButtonBorder: '#d1d5db',
                  defaultButtonText: '#374151',
                  dividerBackground: '#e5e7eb',
                  inputBackground: '#ffffff',
                  inputBorder: '#d1d5db',
                  inputBorderHover: '#9ca3af',
                  inputBorderFocus: '#f2751a',
                  inputText: '#374151',
                  inputLabelText: '#6b7280',
                  inputPlaceholderText: '#9ca3af',
                  messageText: '#6b7280',
                  messageTextDanger: '#dc2626',
                  anchorTextColor: '#f2751a',
                  anchorTextHoverColor: '#e35a0f',
                },
                borderWidths: {
                  buttonBorderWidth: '1px',
                  inputBorderWidth: '1px',
                },
                borderRadius: {
                  buttonBorderRadius: '12px',
                  inputBorderRadius: '12px',
                },
                spacing: {
                  inputPadding: '12px 16px',
                  buttonPadding: '12px 16px',
                },
                fontSizes: {
                  baseInputSize: '16px',
                  baseLabelSize: '14px',
                  baseButtonSize: '16px',
                },
              },
            },
          }}
          providers={['google']}
          localization={{
            variables: {
              sign_in: {
                email_label: 'Email',
                password_label: 'Пароль',
                button_label: 'Войти',
                loading_button_label: 'Вход...',
                social_provider_text: 'Войти через {{provider}}',
                link_text: 'Уже есть аккаунт? Войти',
              },
              sign_up: {
                email_label: 'Email',
                password_label: 'Пароль',
                button_label: 'Зарегистрироваться',
                loading_button_label: 'Регистрация...',
                social_provider_text: 'Зарегистрироваться через {{provider}}',
                link_text: 'Нет аккаунта? Зарегистрироваться',
              },
              forgotten_password: {
                email_label: 'Email',
                button_label: 'Отправить инструкции',
                loading_button_label: 'Отправка...',
                link_text: 'Забыли пароль?',
              },
            },
          }}
        />
      </div>

      {/* Additional Info */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-3">
            Регистрируясь, вы соглашаетесь с нашими условиями использования
          </p>
          <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
            <span>Безопасность</span>
            <span>•</span>
            <span>Конфиденциальность</span>
            <span>•</span>
            <span>Поддержка</span>
          </div>
        </div>
      </div>
    </div>
  )
}
