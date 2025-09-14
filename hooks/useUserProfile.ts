import { useState, useEffect } from "react";

interface User {
    id: string;
    name: string;
    email: string;
    avatar: string;
    joinedYear: string;
}

interface UserStats {
    trips: number;
    points: number;
    badges: number;
}

const mockUser: User = {
    id: "1",
    name: "Priya Sharma",
    email: "priya.sharma@email.com",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200",
    joinedYear: "2021",
};

const mockStats: UserStats = {
    trips: 120,
    points: 1000,
    badges: 10,
};

export function useUserProfile() {
    const [user, setUser] = useState<User>(mockUser);
    const [stats, setStats] = useState<UserStats>(mockStats);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate API call
        setTimeout(() => {
            setLoading(false);
        }, 500);
    }, []);

    const updateProfile = (updates: Partial<User>) => {
        setUser(prev => ({ ...prev, ...updates }));
    };

    return {
        user,
        stats,
        loading,
        updateProfile,
    };
}