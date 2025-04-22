
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Loader } from "lucide-react";

const Profile = () => {
  const { user, loading } = useSupabaseAuth();
  const [profile, setProfile] = useState<{ full_name?: string } | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setProfileLoading(false);
      return;
    }
    setProfileLoading(true);
    supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single()
      .then(({ data, error }) => {
        setProfile(data || null);
        setProfileLoading(false);
      });
  }, [user]);

  if (loading) return <div className="p-8 flex justify-center items-center"><Loader className="animate-spin" /></div>;
  if (!user) return <div className="p-8 text-center">Please log in to see your profile.</div>;
  if (profileLoading) return <div className="p-8 flex justify-center items-center"><Loader className="animate-spin" /></div>;

  return (
    <div className="container py-8">
      <Card>
        <CardHeader>
          <CardTitle>Your Profile</CardTitle>
          <CardDescription>Manage your profile details here.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="py-2">
            <div className="font-medium">Full Name:</div>
            <div>{profile?.full_name || <span className="italic text-muted-foreground">Not set</span>}</div>
          </div>
          <div className="py-2">
            <div className="font-medium">Email:</div>
            <div>{user.email}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
