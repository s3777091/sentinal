import { Card } from '@/components/ui/card';
import ReactMarkdown from 'react-markdown';

export default function MessageBox(props: { output: string }) {
  const { output } = props;
  return (
    <Card
      className={`${
        output ? 'flex' : 'hidden'
      } !max-h-max p-5 !px-[22px] !py-[22px] text-base font-normal leading-6 bg-[#7878A3] text-white backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-100 dark:text-black md:text-base md:leading-[26px]`}
    >
      <ReactMarkdown className="text-base font-normal">
        {output ? output : ''}
      </ReactMarkdown>
    </Card>
  );
}