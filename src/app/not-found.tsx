import { paths } from '@/paths'
import Link from 'next/link'
import React from 'react'

const NotFound = () => {
  return (
    <section
      style={{
        textAlign: 'center'
      }}
    >
      <h1>Sorry, this page is not available.</h1>
      <p>The link you followed may be broken, or the page may have been removed. <Link href={paths.auth.signIn}>Go back to Invoicer.</Link></p>
    </section>
  )
}

export default NotFound