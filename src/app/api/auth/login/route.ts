import { NextResponse } from 'next/server';
import { supabase } from "@/lib/supabase";

interface LoginAttempt {
    attempts: number;
}

interface LoginAttempts {
    [userId: string]: LoginAttempt;
}

const loginAttempts: LoginAttempts = {};
const ATTEMPT_LIMIT = 5;
const RESET_INTERVAL = 60 * 1000; // 1 minute in milliseconds

// Function to reset login attempts
const resetAttempts = (userId: string) => {
    delete loginAttempts[userId];
};

// Call this function periodically to reset all attempts
setInterval(() => {
    for (const userId in loginAttempts) {
        resetAttempts(userId);
    }
}, RESET_INTERVAL);

export async function POST(request: Request) {
    const { email, password } = await request.json();
    const userId = `${email}`; // Using email as a unique identifier

    try {
        const { data: { user }, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) throw error;

        // Check if user is not null
        if (!user) {
            return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
        }

        // Fetch user profile
        const { data: profile, error: profileError } = await supabase
            .from('subscribers_profiles')
            .select('*') // Select all fields
            .eq('subscriber_id', user.id)
            .single();

        if (profileError) throw profileError;

        // Check login attempts
        const attempts = loginAttempts[userId]?.attempts || 0;

        if (attempts >= ATTEMPT_LIMIT) {
            return NextResponse.json({ error: 'Доступ заблокирован. Слишком много попыток входа.' }, { status: 403 });
        }

        // Reset attempts on successful login
        resetAttempts(userId);

        // Return user profile along with success status
        return NextResponse.json({ success: true, profile });
    } catch (error) {
        console.error('Login error:', error);

        // Increment login attempts on failure
        if (!loginAttempts[userId]) {
            loginAttempts[userId] = { attempts: 0 };
        }
        loginAttempts[userId].attempts += 1;

        return NextResponse.json({ success: false }, { status: 401 });
    }
}