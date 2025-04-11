import type { AppProps } from 'next/app';
import Head from 'next/head';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <style>{`
          /* Hide Next.js Developer Badge */
          #__next-build-watcher,
          [data-nextjs-dialog-supporting],
          [data-nextjs-dialog],
          #nextjs-portal-root {
            display: none !important;
          }
          circle > text, .nextjs-container-build-watcher-circle {
            display: none !important;
          }
        `}</style>
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;