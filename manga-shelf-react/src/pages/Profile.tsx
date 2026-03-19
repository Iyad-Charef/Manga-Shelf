import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../api/client';
import { Loader2 } from 'lucide-react';

export const Profile = () => {
    const { username } = useParams<{ username: string }>();

    const { data: profile, isLoading, error } = useQuery({
        queryKey: ['profile', username],
        queryFn: async () => {
            const res = await api.get(`/users/${username}`);
            return res.data;
        },
        enabled: !!username
    });

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-[70vh]">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="text-center p-12 text-muted-foreground">
                <h2 className="text-2xl font-bold mb-2">User not found</h2>
                <p>The profile you're looking for doesn't exist.</p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto p-4 md:p-8 min-h-[70vh]">
            <div className="flex items-center gap-6 mb-12">
                {profile.user.profilePic ? (
                    <img src={profile.user.profilePic} alt={profile.user.username} className="h-24 w-24 rounded-full object-cover shadow-xl border-4 border-card" />
                ) : (
                    <div className="h-24 w-24 rounded-full bg-indigo-600 flex items-center justify-center text-3xl font-bold text-white shadow-xl">
                        {profile.user.username.charAt(0).toUpperCase()}
                    </div>
                )}
                <div>
                    <h1 className="text-3xl font-bold text-foreground mb-1">{profile.user.username}'s Profile</h1>
                    <p className="text-muted-foreground flex gap-4 text-sm mt-2">
                        <span className="bg-secondary px-3 py-1 rounded-full text-secondary-foreground"><strong>{profile.stats.mangaRead}</strong> Manga Read</span>
                        <span className="bg-secondary px-3 py-1 rounded-full text-secondary-foreground"><strong>{profile.stats.totalLibrary}</strong> In Library</span>
                        <span className="bg-secondary px-3 py-1 rounded-full text-secondary-foreground"><strong>{Number(profile.stats.averageRating).toFixed(1)}</strong> Avg. Rating</span>
                    </p>
                </div>
            </div>

            <h2 className="text-xl font-bold text-foreground mb-4">Recent Activity</h2>
            {profile.recentActivity?.length > 0 ? (
                <div className="space-y-4">
                    {/* Activity mapped here */}
                </div>
            ) : (
                <div className="bg-card rounded-2xl border border-border p-8 text-center text-muted-foreground shadow-sm">
                    No recent activity to show yet.
                </div>
            )}
        </div>
    );
};
