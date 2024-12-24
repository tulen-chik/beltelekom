import {supabase} from "@/lib/supabase";

async function seedUsers() {
    try {
        // Insert subscribers
        const { data: adminSubscriber, error: adminSubscriberError } = await supabase
            .from('subscribers')
            .insert([{ subscriber_number: 'admin123' }]);

        if (adminSubscriberError) throw adminSubscriberError;

        const { data: regularSubscriber, error: regularSubscriberError } = await supabase
            .from('subscribers')
            .insert([{ subscriber_number: 'user456' }]);

        if (regularSubscriberError) throw regularSubscriberError;

        // Create admin user
        const { data: adminUser, error: adminError } = await supabase.auth.admin.createUser({
            email: 'admin@example.com',
            password: 'admin123',
            email_confirm: true,
            user_metadata: {
                full_name: 'Иванов Иван Иванович',
                subscriber_number: 'admin123',
                address: 'ул. Административная, д. 1, кв. 1',
                category: '1'
            }
        });

        if (adminError) throw adminError;

        console.log('✅ Admin user created:', adminUser);

        // Create regular user
        const { data: regularUser, error: regularError } = await supabase.auth.admin.createUser({
            email: 'user@example.com',
            password: 'user456',
            email_confirm: true,
            user_metadata: {
                full_name: 'Петров Петр Петрович',
                subscriber_number: 'user456',
                address: 'ул. Пользовательская, д. 2, кв. 3',
                category: '0.5'
            }
        });

        if (regularError) throw regularError;

        console.log('✅ Regular user created:', regularUser);

        // Insert profiles
        const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .insert([
                {
                    id: adminUser.user.id,
                    role: 'admin',
                    subscriber_number: 'admin123'
                },
                {
                    id: regularUser.user.id,
                    role: 'user',
                    subscriber_number: 'user456'
                }
            ])
            .select();

        if (profilesError) throw profilesError;

        console.log('✅ Profiles created:', profiles);
        console.log('\nTest users created successfully!');
        console.log('\nYou can now log in with:');
        console.log('Admin - email: admin@example.com, password: admin123');
        console.log('User - email: user@example.com, password: user456');

    } catch (error) {
        console.error('Error seeding users:', error);
    }
}