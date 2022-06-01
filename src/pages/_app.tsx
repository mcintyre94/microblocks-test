import Head from 'next/head'
import { AppProps } from 'next/app'
import '../styles/index.css'
import StacksProvider from '../providers/StacksProvider'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Microblocks Test: Repro</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <StacksProvider>
        <Component {...pageProps} />
      </StacksProvider>
    </>
  )
}

export default MyApp