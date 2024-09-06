import Community from "@/components/shared/community";

const Home = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  return (
    <>
      <h1 className="head-text">Communities</h1>
      <Community searchParams={searchParams} />
    </>
  );
};

export default Home;