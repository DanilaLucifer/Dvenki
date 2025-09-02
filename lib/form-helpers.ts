import { useForm, UseFormReturn } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

// Хелпер для создания формы с валидацией Zod
export const createForm = <T extends z.ZodType>(schema: T) => {
  return useForm<z.infer<T>>({
    resolver: zodResolver(schema),
    mode: 'onChange'
  })
}

// Хелпер для обработки ошибок формы
export const getFormError = (form: UseFormReturn<any>, fieldName: string) => {
  const error = form.formState.errors[fieldName]
  return error?.message as string | undefined
}

// Хелпер для проверки валидности формы
export const isFormValid = (form: UseFormReturn<any>) => {
  return form.formState.isValid && !form.formState.isSubmitting
}

// Хелпер для сброса формы
export const resetForm = (form: UseFormReturn<any>, defaultValues?: any) => {
  form.reset(defaultValues || {})
  form.clearErrors()
}

// Хелпер для установки значений формы
export const setFormValues = (form: UseFormReturn<any>, values: any) => {
  Object.keys(values).forEach(key => {
    form.setValue(key, values[key])
  })
}

// Хелпер для валидации одного поля
export const validateField = async (form: UseFormReturn<any>, fieldName: string) => {
  return await form.trigger(fieldName)
}

// Хелпер для валидации нескольких полей
export const validateFields = async (form: UseFormReturn<any>, fieldNames: string[]) => {
  return await form.trigger(fieldNames)
}

// Хелпер для получения состояния загрузки формы
export const getFormLoadingState = (form: UseFormReturn<any>) => {
  return {
    isSubmitting: form.formState.isSubmitting,
    isDirty: form.formState.isDirty,
    isValid: form.formState.isValid,
    errors: form.formState.errors
  }
}

// Хелпер для создания поля формы с обработкой ошибок
export const createFormField = (
  form: UseFormReturn<any>,
  fieldName: string,
  options?: {
    label?: string
    placeholder?: string
    type?: string
    required?: boolean
  }
) => {
  const error = getFormError(form, fieldName)
  const isRequired = options?.required || false

  return {
    name: fieldName,
    label: options?.label || fieldName,
    placeholder: options?.placeholder || `Введите ${options?.label || fieldName}`,
    type: options?.type || 'text',
    required: isRequired,
    error,
    hasError: !!error,
    register: form.register(fieldName),
    setValue: (value: any) => form.setValue(fieldName, value),
    getValue: () => form.getValues(fieldName),
    clearError: () => form.clearErrors(fieldName)
  }
}

// Хелпер для создания текстового поля
export const createTextField = (
  form: UseFormReturn<any>,
  fieldName: string,
  options?: {
    label?: string
    placeholder?: string
    required?: boolean
    multiline?: boolean
    rows?: number
  }
) => {
  const field = createFormField(form, fieldName, options)
  
  return {
    ...field,
    multiline: options?.multiline || false,
    rows: options?.rows || 3,
    inputProps: {
      ...form.register(fieldName),
      className: `input-field ${field.hasError ? 'border-red-500' : ''}`,
      'aria-invalid': field.hasError,
      'aria-describedby': field.hasError ? `${fieldName}-error` : undefined
    }
  }
}

// Хелпер для создания поля выбора
export const createSelectField = (
  form: UseFormReturn<any>,
  fieldName: string,
  options: Array<{ value: string; label: string }>,
  fieldOptions?: {
    label?: string
    placeholder?: string
    required?: boolean
  }
) => {
  const field = createFormField(form, fieldName, fieldOptions)
  
  return {
    ...field,
    options,
    selectProps: {
      ...form.register(fieldName),
      className: `input-field ${field.hasError ? 'border-red-500' : ''}`,
      'aria-invalid': field.hasError,
      'aria-describedby': field.hasError ? `${fieldName}-error` : undefined
    }
  }
}

// Хелпер для создания поля с чекбоксом
export const createCheckboxField = (
  form: UseFormReturn<any>,
  fieldName: string,
  options?: {
    label?: string
    required?: boolean
  }
) => {
  const field = createFormField(form, fieldName, options)
  
  return {
    ...field,
    checkboxProps: {
      ...form.register(fieldName),
      className: 'rounded border-gray-300 text-primary-600 focus:ring-primary-500',
      'aria-invalid': field.hasError,
      'aria-describedby': field.hasError ? `${fieldName}-error` : undefined
    }
  }
}

// Хелпер для создания поля с радио-кнопками
export const createRadioField = (
  form: UseFormReturn<any>,
  fieldName: string,
  options: Array<{ value: string; label: string }>,
  fieldOptions?: {
    label?: string
    required?: boolean
  }
) => {
  const field = createFormField(form, fieldName, fieldOptions)
  
  return {
    ...field,
    options,
    radioProps: (value: string) => ({
      ...form.register(fieldName),
      value,
      className: 'text-primary-600 focus:ring-primary-500 border-gray-300',
      'aria-invalid': field.hasError,
      'aria-describedby': field.hasError ? `${fieldName}-error` : undefined
    })
  }
}

// Хелпер для создания поля с файлом
export const createFileField = (
  form: UseFormReturn<any>,
  fieldName: string,
  options?: {
    label?: string
    accept?: string
    multiple?: boolean
    required?: boolean
  }
) => {
  const field = createFormField(form, fieldName, options)
  
  return {
    ...field,
    accept: options?.accept || 'image/*',
    multiple: options?.multiple || false,
    fileProps: {
      ...form.register(fieldName),
      className: 'input-field',
      accept: options?.accept || 'image/*',
      multiple: options?.multiple || false,
      'aria-invalid': field.hasError,
      'aria-describedby': field.hasError ? `${fieldName}-error` : undefined
    }
  }
}

// Хелпер для создания поля с датой
export const createDateField = (
  form: UseFormReturn<any>,
  fieldName: string,
  options?: {
    label?: string
    required?: boolean
    min?: string
    max?: string
  }
) => {
  const field = createFormField(form, fieldName, options)
  
  return {
    ...field,
    type: 'date',
    dateProps: {
      ...form.register(fieldName),
      className: `input-field ${field.hasError ? 'border-red-500' : ''}`,
      min: options?.min,
      max: options?.max,
      'aria-invalid': field.hasError,
      'aria-describedby': field.hasError ? `${fieldName}-error` : undefined
    }
  }
}

// Хелпер для создания поля с временем
export const createTimeField = (
  form: UseFormReturn<any>,
  fieldName: string,
  options?: {
    label?: string
    required?: boolean
  }
) => {
  const field = createFormField(form, fieldName, options)
  
  return {
    ...field,
    type: 'time',
    timeProps: {
      ...form.register(fieldName),
      className: `input-field ${field.hasError ? 'border-red-500' : ''}`,
      'aria-invalid': field.hasError,
      'aria-describedby': field.hasError ? `${fieldName}-error` : undefined
    }
  }
}

// Хелпер для создания поля с числом
export const createNumberField = (
  form: UseFormReturn<any>,
  fieldName: string,
  options?: {
    label?: string
    placeholder?: string
    required?: boolean
    min?: number
    max?: number
    step?: number
  }
) => {
  const field = createFormField(form, fieldName, options)
  
  return {
    ...field,
    type: 'number',
    numberProps: {
      ...form.register(fieldName),
      className: `input-field ${field.hasError ? 'border-red-500' : ''}`,
      min: options?.min,
      max: options?.max,
      step: options?.step,
      'aria-invalid': field.hasError,
      'aria-describedby': field.hasError ? `${fieldName}-error` : undefined
    }
  }
}

// Хелпер для создания поля с email
export const createEmailField = (
  form: UseFormReturn<any>,
  fieldName: string,
  options?: {
    label?: string
    placeholder?: string
    required?: boolean
  }
) => {
  const field = createFormField(form, fieldName, options)
  
  return {
    ...field,
    type: 'email',
    emailProps: {
      ...form.register(fieldName),
      className: `input-field ${field.hasError ? 'border-red-500' : ''}`,
      placeholder: options?.placeholder || 'example@email.com',
      'aria-invalid': field.hasError,
      'aria-describedby': field.hasError ? `${fieldName}-error` : undefined
    }
  }
}

// Хелпер для создания поля с паролем
export const createPasswordField = (
  form: UseFormReturn<any>,
  fieldName: string,
  options?: {
    label?: string
    placeholder?: string
    required?: boolean
  }
) => {
  const field = createFormField(form, fieldName, options)
  
  return {
    ...field,
    type: 'password',
    passwordProps: {
      ...form.register(fieldName),
      className: `input-field ${field.hasError ? 'border-red-500' : ''}`,
      placeholder: options?.placeholder || 'Введите пароль',
      'aria-invalid': field.hasError,
      'aria-describedby': field.hasError ? `${fieldName}-error` : undefined
    }
  }
}
