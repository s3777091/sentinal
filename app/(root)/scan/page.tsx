'use client'; // Ensure this line is at the top

import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import Image from 'next/image';

import { Mail } from '@/components/shared/mail';
import { accounts, mails } from '@/app/(root)/scan/data';

export default function MailPage() {
  const [defaultLayout, setDefaultLayout] = useState(undefined);
  const [defaultCollapsed, setDefaultCollapsed] = useState(undefined);

  useEffect(() => {
    const layout = Cookies.get('react-resizable-panels:layout');
    const collapsed = Cookies.get('react-resizable-panels:collapsed');

    const parseJSON = (value) => {
      try {
        return JSON.parse(value);
      } catch (e) {
        console.error('Failed to parse JSON:', e);
        return undefined;
      }
    };

    setDefaultLayout(layout ? parseJSON(layout) : undefined);
    setDefaultCollapsed(collapsed ? parseJSON(collapsed) : undefined);

  }, []);

  return (
    <>
      {/* <div className="md:hidden">
        <Image
          src="/examples/mail-dark.png"
          width={1280}
          height={727}
          alt="Mail"
          className="hidden dark:block"
        />
        <Image
          src="/examples/mail-light.png"
          width={1280}
          height={727}
          alt="Mail"
          className="block dark:hidden"
        />
      </div> */}
      <div className="min-h-[100vh] flex-col md:flex">
        <Mail
          accounts={accounts}
          mails={mails}
          defaultLayout={defaultLayout}
          defaultCollapsed={defaultCollapsed}
        />
      </div>
    </>
  );
}
