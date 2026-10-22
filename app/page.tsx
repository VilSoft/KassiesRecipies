import Layout from '@/components/Layout'
import Recipies from "@/components/Recipies";
import Navbar from "@/components/Navbar";
import { ReduxProvider } from '@/redux/provider';
import { ToastProvider } from '@/components/Toast';

export default function Home() {
  return (
    <ReduxProvider>
      <ToastProvider>
        <Layout>
          <Navbar />
          <Recipies />
        </Layout>
      </ToastProvider>
    </ReduxProvider>
  );
}
