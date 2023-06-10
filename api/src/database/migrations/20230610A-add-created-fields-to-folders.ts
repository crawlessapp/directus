import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
	await knex.schema.alterTable('directus_folders', (table) => {
		table.timestamp('created_on').defaultTo(knex.fn.now());
		table.uuid('created_by').references('id').inTable('directus_users').onDelete('SET NULL');
	});

	const userInterfaceOptions = { template: '{{avatar.$thumbnail}} {{first_name}} {{last_name}}' };
	await knex('directus_fields').insert([
		{
			collection: 'directus_folders',
			field: 'created_by',
			special: 'user-created',
			interface: 'select-dropdown-m2o',
			options: userInterfaceOptions,
			display: 'user',
			readonly: true,
			hidden: true,
			width: 'half',
		},
		{
			collection: 'directus_folders',
			field: 'created_on',
			special: 'date-created',
			interface: 'datetime',
			display: 'datetime',
			display_options: { relative: true },
			readonly: true,
			hidden: true,
			width: 'half',
		},
	]);
}

export async function down(knex: Knex): Promise<void> {
	await knex('directus_fields')
		.whereIn('field', ['created_by', 'created_on'])
		.andWhere('collection', 'directus_folders')
		.del();
	await knex.schema.alterTable('directus_folders', (table) => {
		table.dropColumn('created_by');
		table.dropColumn('created_on');
	});
}
