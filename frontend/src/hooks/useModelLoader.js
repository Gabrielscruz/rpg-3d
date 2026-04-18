import { useCallback } from 'react'

/**
 * Hook to handle GLB model loading from file input
 */
export function useModelLoader() {
  const loadModelFromFile = useCallback((file) => {
    return new Promise((resolve, reject) => {
      if (!file) {
        reject(new Error('No file provided'))
        return
      }

      const validExtensions = ['.glb', '.gltf']
      const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()
      
      if (!validExtensions.includes(ext)) {
        reject(new Error('Formato inválido. Use arquivos .glb ou .gltf'))
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const blob = new Blob([e.target.result], { type: 'model/gltf-binary' })
        const url = URL.createObjectURL(blob)
        resolve({
          url,
          fileName: file.name,
          size: file.size,
        })
      }
      reader.onerror = () => reject(new Error('Erro ao ler o arquivo'))
      reader.readAsArrayBuffer(file)
    })
  }, [])

  const revokeModelUrl = useCallback((url) => {
    if (url && url.startsWith('blob:')) {
      URL.revokeObjectURL(url)
    }
  }, [])

  return { loadModelFromFile, revokeModelUrl }
}
