export const metadata = {
   title: "Admin",
   description: "Admin page",
   robots: {
     index: false,
     follow: false,
   },
 };


 export default function AdminLayout({ children }) {
    return (
      <>
          {children}
      </>
    );
  }
