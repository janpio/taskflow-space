import { GetServerSidePropsContext } from "next";
import Head from "next/head";
import { getSession } from "next-auth/react";

import DashboardLayout from "@/modules/Dashboard/DashboardLayout";
import Invitations from "@/modules/Dashboard/Invitations/Invitations";

function DashboardPage() {
  return (
    <DashboardLayout>
      <Head>
        <title>Taskflow | Invitations</title>
      </Head>
      <Invitations />
    </DashboardLayout>
  );
}

export default DashboardPage;

// make server call to redirect to /signin if not authenticated nextauth
export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getSession(context);
  if (!session) {
    return {
      redirect: {
        destination: "/signin",
        permanent: false,
      },
    };
  }
  return {
    props: { session },
  };
}
