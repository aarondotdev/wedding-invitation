/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
/* DO NOT MODIFY IT BECAUSE IT COULD BE REWRITTEN AT ANY TIME. */
import config from '@payload-config'
import '@payloadcms/next/css'
import type { ServerFunctionClient } from 'payload'
import { handleServerFunctions, RootLayout } from '@payloadcms/next/layouts'
import { connection } from 'next/server'
import React from 'react'

import { importMap } from './cms/importMap.js'
import './custom.scss'

type Args = {
  children: React.ReactNode
}

// Added by hand (keep both if Payload regenerates this file): the CMS admin renders per request.
// `instant = false` allows the route to block, and `await connection()` below marks it as request-time
// before Payload reads the clock; without it Next reports "Blocking Route ... new Date()" on /cms.
export const instant = false

const serverFunction: ServerFunctionClient = async function (args) {
  'use server'
  return handleServerFunctions({
    ...args,
    config,
    importMap,
  })
}

const Layout = async ({ children }: Args) => {
  await connection()
  return (
    <RootLayout config={config} importMap={importMap} serverFunction={serverFunction}>
      {children}
    </RootLayout>
  )
}

export default Layout
