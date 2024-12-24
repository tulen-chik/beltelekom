import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
    try {
        // Create admin user
        const { data: adminUser, error: createAdminError } = await supabase.auth.admin.createUser({
            email: 'admin@example.com',
            password: 'admin123',
            email_confirm: true,
            user_metadata: {
                full_name: 'Иванов Иван Иванович',
                address: 'ул. Административная, д. 1, кв. 1'
            }
        });

        if (createAdminError) throw createAdminError;

        console.log('✅ Admin user created:', adminUser);

        // Create regular user
        const { data: regularUser, error: createRegularError } = await supabase.auth.admin.createUser({
            email: 'user@example.com',
            password: 'user456',
            email_confirm: true,
            user_metadata: {
                full_name: 'Петров Петр Петрович',
                address: 'ул. Пользовательская, д. 2, кв. 3'
            }
        });

        if (createRegularError) throw createRegularError;

        console.log('✅ Regular user created:', regularUser);

        // Insert subscribers_profiles using created user IDs
        const { data: adminSubscriberProfile, error: adminProfileError } = await supabase
            .from('subscribers_profiles')
            .insert([{
                subscriber_id: adminUser.user.id, // Use the created admin user's ID
                category: '1',
                role: 'admin'
            }]);

        if (adminProfileError) throw adminProfileError;

        const { data: regularSubscriberProfile, error: regularProfileError } = await supabase
            .from('subscribers_profiles')
            .insert([{
                subscriber_id: regularUser.user.id, // Use the created regular user's ID
                category: '0.5',
                role: 'user'
            }]);

        if (regularProfileError) throw regularProfileError;

        console.log('✅ Subscribers profiles created:', adminSubscriberProfile, regularSubscriberProfile);
        console.log('\nTest users created successfully!');
        console.log('\nYou can now log in with:');
        console.log('Admin - email: admin@example.com, password: admin123');
        console.log('User - email: user@example.com, password: user456');

    } catch (error) {
        console.error('Error seeding users:', error);
    }
}

export async function POST(request: Request) {
    const { email, password } = await request.json();

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

        // Check if user is admin
        const { data: profile, error: profileError } = await supabase
            .from('subscribers_profiles')
            .select('role')
            .eq('subscriber_id', user.id)  // Use subscriber_id to match the new schema
            .single();

        if (profileError) throw profileError;

        if (profile?.role !== 'admin') {
            return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ success: false }, { status: 401 });
    }
}