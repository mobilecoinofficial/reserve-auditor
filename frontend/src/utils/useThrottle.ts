import { useCallback, useRef, useEffect } from 'react'
import { throttle } from 'lodash'

export default function useThrottle(cb: (...args: any) => void, delay: number) {
  const options = { leading: true, trailing: true }
  const cbRef = useRef(cb)
  // use mutable ref to make useCallback/throttle not depend on `cb` dep
  useEffect(() => {
    cbRef.current = cb
  })

  return useCallback(
    throttle((...args) => cbRef.current(...args), delay, options),
    [delay]
  )
}
