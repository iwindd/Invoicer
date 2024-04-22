'use client' // Error components must be Client Components

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {

  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <section
      style={{
        textAlign: 'center'
      }}
    >
      <h1>Something went wrong!.</h1>
      <a onClick={() => reset()} href='#' >
        ลองใหม่อีกครั้ง
      </a>
    </section>
  )
}