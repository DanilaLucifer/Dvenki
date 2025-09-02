export const validateImageFile = (file: File): { isValid: boolean; error?: string } => {
  // Проверяем тип файла
  if (!file.type.startsWith('image/')) {
    return { isValid: false, error: 'Файл должен быть изображением' }
  }

  // Проверяем размер файла (максимум 5MB)
  const maxSize = 5 * 1024 * 1024 // 5MB
  if (file.size > maxSize) {
    return { isValid: false, error: 'Размер файла не должен превышать 5MB' }
  }

  // Проверяем расширение файла
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
  const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'))
  
  if (!allowedExtensions.includes(fileExtension)) {
    return { isValid: false, error: 'Поддерживаются только JPG, PNG, GIF и WebP файлы' }
  }

  return { isValid: true }
}

export const compressImage = async (
  file: File, 
  maxWidth: number = 1200, 
  quality: number = 0.8
): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      // Вычисляем новые размеры
      let { width, height } = img
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width
        width = maxWidth
      }

      canvas.width = width
      canvas.height = height

      // Рисуем изображение на canvas
      ctx?.drawImage(img, 0, 0, width, height)

      // Конвертируем в blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            })
            resolve(compressedFile)
          } else {
            resolve(file) // Возвращаем оригинальный файл если сжатие не удалось
          }
        },
        file.type,
        quality
      )
    }

    img.src = URL.createObjectURL(file)
  })
}

export const generateThumbnail = async (
  file: File, 
  size: number = 200
): Promise<string> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      // Вычисляем размеры для thumbnail
      let { width, height } = img
      
      if (width > height) {
        height = (height * size) / width
        width = size
      } else {
        width = (width * size) / height
        height = size
      }

      canvas.width = size
      canvas.height = size

      // Центрируем изображение
      const offsetX = (size - width) / 2
      const offsetY = (size - height) / 2

      // Рисуем изображение по центру
      ctx?.drawImage(img, offsetX, offsetY, width, height)

      // Конвертируем в data URL
      const thumbnail = canvas.toDataURL('image/jpeg', 0.8)
      resolve(thumbnail)
    }

    img.src = URL.createObjectURL(file)
  })
}

export const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
  return new Promise((resolve) => {
    const img = new Image()
    
    img.onload = () => {
      resolve({ width: img.width, height: img.height })
    }

    img.src = URL.createObjectURL(file)
  })
}

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export const getImageTypeIcon = (fileType: string): string => {
  if (fileType.includes('jpeg') || fileType.includes('jpg')) return '🖼️'
  if (fileType.includes('png')) return '🖼️'
  if (fileType.includes('gif')) return '🎬'
  if (fileType.includes('webp')) return '🖼️'
  return '📁'
}

// Хелпер для создания превью изображения
export const createImagePreview = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      const result = e.target?.result as string
      resolve(result)
    }
    
    reader.readAsDataURL(file)
  })
}

// Хелпер для проверки ориентации изображения
export const getImageOrientation = (file: File): Promise<'landscape' | 'portrait' | 'square'> => {
  return new Promise((resolve) => {
    const img = new Image()
    
    img.onload = () => {
      if (img.width > img.height) {
        resolve('landscape')
      } else if (img.width < img.height) {
        resolve('portrait')
      } else {
        resolve('square')
      }
    }
    
    img.src = URL.createObjectURL(file)
  })
}

// Хелпер для обрезки изображения
export const cropImage = async (
  file: File,
  cropArea: { x: number; y: number; width: number; height: number }
): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      canvas.width = cropArea.width
      canvas.height = cropArea.height

      // Обрезаем изображение
      ctx?.drawImage(
        img,
        cropArea.x, cropArea.y, cropArea.width, cropArea.height,
        0, 0, cropArea.width, cropArea.height
      )

      // Конвертируем в blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const croppedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            })
            resolve(croppedFile)
          } else {
            resolve(file)
          }
        },
        file.type
      )
    }

    img.src = URL.createObjectURL(file)
  })
}

// Хелпер для поворота изображения
export const rotateImage = async (
  file: File,
  degrees: number
): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      // Вычисляем новые размеры после поворота
      const radians = (degrees * Math.PI) / 180
      const cos = Math.cos(radians)
      const sin = Math.sin(radians)
      
      const newWidth = Math.abs(img.width * cos) + Math.abs(img.height * sin)
      const newHeight = Math.abs(img.width * sin) + Math.abs(img.height * cos)
      
      canvas.width = newWidth
      canvas.height = newHeight

      // Перемещаем в центр
      ctx?.translate(newWidth / 2, newHeight / 2)
      ctx?.rotate(radians)
      ctx?.drawImage(img, -img.width / 2, -img.height / 2)

      // Конвертируем в blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const rotatedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            })
            resolve(rotatedFile)
          } else {
            resolve(file)
          }
        },
        file.type
      )
    }

    img.src = URL.createObjectURL(file)
  })
}

// Хелпер для изменения яркости и контрастности
export const adjustImage = async (
  file: File,
  brightness: number = 0, // -100 to 100
  contrast: number = 0    // -100 to 100
): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height

      // Рисуем изображение
      ctx?.drawImage(img, 0, 0)

      // Применяем фильтры
      const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height)
      if (imageData) {
        const data = imageData.data
        
        for (let i = 0; i < data.length; i += 4) {
          // Яркость
          data[i] = Math.max(0, Math.min(255, data[i] + brightness))
          data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + brightness))
          data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + brightness))
          
          // Контрастность
          const factor = (259 * (contrast + 255)) / (255 * (259 - contrast))
          data[i] = Math.max(0, Math.min(255, factor * (data[i] - 128) + 128))
          data[i + 1] = Math.max(0, Math.min(255, factor * (data[i + 1] - 128) + 128))
          data[i + 2] = Math.max(0, Math.min(255, factor * (data[i + 2] - 128) + 128))
        }
        
        ctx?.putImageData(imageData, 0, 0)
      }

      // Конвертируем в blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const adjustedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            })
            resolve(adjustedFile)
          } else {
            resolve(file)
          }
        },
        file.type
      )
    }

    img.src = URL.createObjectURL(file)
  })
}

// Хелпер для создания водяного знака
export const addWatermark = async (
  file: File,
  watermarkText: string,
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' = 'bottom-right'
): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height

      // Рисуем изображение
      ctx?.drawImage(img, 0, 0)

      // Настраиваем стиль текста
      if (ctx) {
        ctx.font = '24px Arial'
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.7)'
        ctx.lineWidth = 2
        
        // Вычисляем позицию водяного знака
        const textMetrics = ctx.measureText(watermarkText)
        const textWidth = textMetrics.width
        const textHeight = 24
        
        let x: number
        let y: number
        
        switch (position) {
          case 'top-left':
            x = 20
            y = 30
            break
          case 'top-right':
            x = canvas.width - textWidth - 20
            y = 30
            break
          case 'bottom-left':
            x = 20
            y = canvas.height - 20
            break
          case 'bottom-right':
            x = canvas.width - textWidth - 20
            y = canvas.height - 20
            break
        }
        
        // Рисуем водяной знак
        ctx.strokeText(watermarkText, x, y)
        ctx.fillText(watermarkText, x, y)
      }

      // Конвертируем в blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const watermarkedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            })
            resolve(watermarkedFile)
          } else {
            resolve(file)
          }
        },
        file.type
      )
    }

    img.src = URL.createObjectURL(file)
  })
}
