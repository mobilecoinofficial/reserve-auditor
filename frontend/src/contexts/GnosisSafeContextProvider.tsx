import React, { FC, useEffect, useState } from 'react'
import { getGnosisSafeConfig } from '../api/apiHandler'
import { TAuditedSafe } from '../types'

export const GnosisSafeContext = React.createContext<TAuditedSafe | undefined>(
  undefined
)

type TProps = {
  children: React.ReactNode
}

export const GnosisSafeProvider: FC<TProps> = ({ children }: TProps) => {
  const [config, setConfig] = useState<TAuditedSafe>()

  const getConfig = async () => {
    const gnosisConfig = await getGnosisSafeConfig()
    setConfig(gnosisConfig.safes[0])
  }

  useEffect(() => {
    getConfig()
  }, [])

  return (
    <GnosisSafeContext.Provider value={config}>
      {children}
    </GnosisSafeContext.Provider>
  )
}
