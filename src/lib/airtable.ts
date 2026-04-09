import { PaginatedResponse } from '@/types/api';

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_API_URL = 'https://api.airtable.com/v0';

if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
  throw new Error('Missing Airtable credentials. Please set AIRTABLE_API_KEY and AIRTABLE_BASE_ID in .env');
}

interface AirtableRecord<T> {
  id: string;
  fields: T;
  createdTime: string;
}

interface AirtableListResponse<T> {
  records: AirtableRecord<T>[];
  offset?: string;
}

/**
 * Generic function to list records from Airtable
 */
export async function listRecords<T>(
  tableName: string,
  options?: {
    filterByFormula?: string;
    sort?: Array<{ field: string; direction: 'asc' | 'desc' }>;
    maxRecords?: number;
    offset?: string;
  }
): Promise<PaginatedResponse<T>> {
  try {
    const params = new URLSearchParams();

    if (options?.filterByFormula) {
      params.append('filterByFormula', options.filterByFormula);
    }

    if (options?.sort) {
      options.sort.forEach((sortItem, index) => {
        params.append(`sort[${index}][field]`, sortItem.field);
        params.append(`sort[${index}][direction]`, sortItem.direction);
      });
    }

    if (options?.maxRecords) {
      params.append('maxRecords', options.maxRecords.toString());
    }

    if (options?.offset) {
      params.append('offset', options.offset);
    }

    const url = `${AIRTABLE_API_URL}/${AIRTABLE_BASE_ID}/${tableName}?${params.toString()}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Airtable API error: ${errorData.error?.message || response.statusText}`);
    }

    const data: AirtableListResponse<T> = await response.json();

    return {
      records: data.records.map(record => ({
        id: record.id,
        ...record.fields,
      } as T)),
      offset: data.offset,
    };
  } catch (error) {
    throw new Error(`Failed to list records from ${tableName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generic function to get a single record from Airtable
 */
export async function getRecord<T>(
  tableName: string,
  recordId: string
): Promise<T> {
  try {
    const url = `${AIRTABLE_API_URL}/${AIRTABLE_BASE_ID}/${tableName}/${recordId}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Record not found');
      }
      const errorData = await response.json();
      throw new Error(`Airtable API error: ${errorData.error?.message || response.statusText}`);
    }

    const data: AirtableRecord<T> = await response.json();

    return {
      id: data.id,
      ...data.fields,
    } as T;
  } catch (error) {
    throw new Error(`Failed to get record from ${tableName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generic function to create a record in Airtable
 */
export async function createRecord<T>(
  tableName: string,
  fields: Partial<T>
): Promise<T> {
  try {
    const url = `${AIRTABLE_API_URL}/${AIRTABLE_BASE_ID}/${tableName}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fields }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Airtable API error: ${errorData.error?.message || response.statusText}`);
    }

    const data: AirtableRecord<T> = await response.json();

    return {
      id: data.id,
      ...data.fields,
    } as T;
  } catch (error) {
    throw new Error(`Failed to create record in ${tableName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generic function to update a record in Airtable
 */
export async function updateRecord<T>(
  tableName: string,
  recordId: string,
  fields: Partial<T>
): Promise<T> {
  try {
    const url = `${AIRTABLE_API_URL}/${AIRTABLE_BASE_ID}/${tableName}/${recordId}`;

    console.log('🔧 Airtable PATCH Request:', {
      url,
      recordId,
      fieldsCount: Object.keys(fields).length,
      fields: JSON.stringify(fields, null, 2)
    });

    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fields }),
    });

    console.log('📡 Airtable Response Status:', response.status, response.statusText);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Airtable Error Response:', errorData);

      if (response.status === 404) {
        throw new Error('Record not found');
      }
      throw new Error(`Airtable API error: ${errorData.error?.message || response.statusText}`);
    }

    const data: AirtableRecord<T> = await response.json();

    return {
      id: data.id,
      ...data.fields,
    } as T;
  } catch (error) {
    throw new Error(`Failed to update record in ${tableName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generic function to delete a record from Airtable
 */
export async function deleteRecord(
  tableName: string,
  recordId: string
): Promise<void> {
  try {
    const url = `${AIRTABLE_API_URL}/${AIRTABLE_BASE_ID}/${tableName}/${recordId}`;

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Record not found');
      }
      const errorData = await response.json();
      throw new Error(`Airtable API error: ${errorData.error?.message || response.statusText}`);
    }
  } catch (error) {
    throw new Error(`Failed to delete record from ${tableName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// ============================================
// Dual Table Support: Invoices + Vendors
// ============================================

import type { Invoice } from '@/types/invoice';

const INVOICES_TABLE_ID = process.env.AIRTABLE_INVOICES_TABLE;
const VENDORS_TABLE_ID = process.env.AIRTABLE_VENDORS_TABLE_ID;

if (!INVOICES_TABLE_ID || !VENDORS_TABLE_ID) {
  console.warn('Warning: AIRTABLE_INVOICES_TABLE or AIRTABLE_VENDORS_TABLE_ID not set');
}

/**
 * Map Airtable field names (with spaces) to code field names (with underscores)
 * Used when reading from Invoices table (email/webhook)
 */
function mapInvoiceFieldsFromAirtable(airtableRecord: any): Invoice {
  return {
    id: airtableRecord.id,
    invoice_number: airtableRecord['invoice_number'],
    vendor_name: airtableRecord['vendor_name'],
    amount: airtableRecord['amount'],
    currency: airtableRecord['currency'],
    invoice_date: airtableRecord['invoice_date'],
    due_date: airtableRecord['due_date'],
    status: airtableRecord['status'],
    notes: airtableRecord['notes'],
    pdf_url: airtableRecord['pdf_url'],
    payment_link: airtableRecord['payment_link'],
    uploaded_by: airtableRecord['uploaded_by'],
    uploaded_at: airtableRecord['uploaded_at'],
    paid_at: airtableRecord['paid_at'],
    paid_by: airtableRecord['paid_by'],
    cancelled_at: airtableRecord['cancelled_at'],
    cancelled_by: airtableRecord['cancelled_by'],
    source: airtableRecord['source'],
    month_year: airtableRecord['month_year'],
    // Internal fields
    _source: 'invoices',
    _tableId: INVOICES_TABLE_ID,
  } as Invoice;
}

/**
 * Map Airtable field names (with spaces) to code field names (with underscores)
 * Used when reading from Vendors table
 */
function mapVendorFieldsFromAirtable(airtableRecord: any): Invoice {
  return {
    id: airtableRecord.id,
    vendor_name: airtableRecord['vendor name'],
    amount: airtableRecord['amount'],
    currency: airtableRecord['currency'],
    invoice_date: airtableRecord['invoice date'],
    due_date: airtableRecord['due date'],
    status: airtableRecord['status'],
    notes: airtableRecord['notes'],
    payment_URL: airtableRecord['payment URL'],
    uploaded_by: airtableRecord['uploaded by'],
    email: airtableRecord['email'],
    currency_preference: airtableRecord['currency_preference'],
    invoice_file: airtableRecord['invoice file'],
    paid_at: airtableRecord['paid at'],
    paid_by: airtableRecord['paid by'],
    cancelled_at: airtableRecord['cancelled_at'],
    cancelled_by: airtableRecord['cancelled by'],
    // Internal fields
    _source: 'vendors',
    _tableId: VENDORS_TABLE_ID,
  } as Invoice;
}

/**
 * Get invoices from Invoices table with field mapping
 */
export async function getEmailInvoices(filterByFormula?: string): Promise<PaginatedResponse<Invoice>> {
  if (!INVOICES_TABLE_ID) {
    throw new Error('INVOICES_TABLE_ID not configured');
  }

  const result = await listRecords(INVOICES_TABLE_ID, {
    filterByFormula,
    maxRecords: 50,
  });

  if (result.records.length > 0) {
    console.log('🔍 Raw Invoices table record keys:', result.records[0] ? Object.keys(result.records[0]) : []);
    console.log('🔍 Raw Invoices table record (first):', result.records[0]);
  }

  // Map Airtable field names to code field names
  const mappedRecords = result.records.map((record: any) => mapInvoiceFieldsFromAirtable(record));

  if (mappedRecords.length > 0) {
    console.log('🔍 Mapped Invoices record (first):', mappedRecords[0]);
  }

  return {
    records: mappedRecords,
    offset: result.offset,
  };
}

/**
 * Get invoices from Vendors table with field mapping
 */
export async function getVendorInvoices(filterByFormula?: string): Promise<PaginatedResponse<Invoice>> {
  if (!VENDORS_TABLE_ID) {
    throw new Error('VENDORS_TABLE_ID not configured');
  }

  const result = await listRecords(VENDORS_TABLE_ID, {
    filterByFormula,
    maxRecords: 50,
  });

  // Map Airtable field names to code field names
  const mappedRecords = result.records.map((record: any) => mapVendorFieldsFromAirtable(record));

  return {
    records: mappedRecords,
    offset: result.offset,
  };
}

/**
 * Get invoices from Invoices table (email/webhook source)
 */
export async function getInvoices(filter?: string): Promise<Invoice[]> {
  if (!INVOICES_TABLE_ID) return [];

  const result = await listRecords<Invoice>(INVOICES_TABLE_ID, {
    filterByFormula: filter,
    sort: [{ field: 'invoice_date', direction: 'desc' }],
  });

  // Add _source and _tableId to each invoice
  return result.records.map(inv => ({
    ...inv,
    _source: 'invoices' as const,
    _tableId: INVOICES_TABLE_ID,
  }));
}

// Note: getVendorInvoices() is now defined above with proper field mapping

/**
 * Get all invoices from both tables merged and sorted by date
 */
export async function getAllInvoices(filter?: string): Promise<Invoice[]> {
  const [emailInvoices, manualInvoicesResult] = await Promise.all([
    getInvoices(filter),
    getVendorInvoices(filter),
  ]);

  // Extract records from PaginatedResponse
  const manualInvoices = manualInvoicesResult.records;

  const all = [...emailInvoices, ...manualInvoices];

  // Sort by invoice_date descending (newest first)
  return all.sort((a, b) => {
    const dateA = a.invoice_date ? new Date(a.invoice_date).getTime() : 0;
    const dateB = b.invoice_date ? new Date(b.invoice_date).getTime() : 0;
    const validDateA = isNaN(dateA) ? 0 : dateA;
    const validDateB = isNaN(dateB) ? 0 : dateB;
    return validDateB - validDateA;
  });
}

/**
 * Create invoice in Invoices table (webhook source)
 */
export async function createInvoice(data: Partial<Invoice>): Promise<Invoice> {
  if (!INVOICES_TABLE_ID) throw new Error('INVOICES_TABLE_ID not configured');

  // Remove internal fields before sending to Airtable
  const { _source, _tableId, invoice_number, ...fields } = data;

  const result = await createRecord<Invoice>(INVOICES_TABLE_ID, fields);

  return {
    ...result,
    _source: 'invoices',
    _tableId: INVOICES_TABLE_ID,
  };
}

/**
 * Create invoice in Vendors table (manual input)
 * Maps field names from code format (snake_case) to Airtable format (space separated)
 */
export async function createVendorInvoice(data: Partial<Invoice>): Promise<Invoice> {
  if (!VENDORS_TABLE_ID) throw new Error('VENDORS_TABLE_ID not configured');

  // Remove internal fields before sending to Airtable
  const { _source, _tableId, invoice_number, ...fields } = data;
  console.log('🔧 createVendorInvoice - fields after destructuring:', JSON.stringify(fields, null, 2));

  // Map field names to Airtable column names (Airtable uses spaces, not underscores)
  const airtableFields: Record<string, any> = {};

  // Required fields (always send)
  if (fields.vendor_name !== undefined) airtableFields['vendor name'] = fields.vendor_name;
  if (fields.amount !== undefined) {
    console.log('💰 Amount field:', fields.amount, 'Type:', typeof fields.amount);
    airtableFields['amount'] = fields.amount;
  } else {
    console.log('⚠️ Amount is undefined!');
  }

  // Send these fields even if empty string (Airtable expects them)
  if (fields.currency !== undefined) airtableFields['currency'] = fields.currency;
  if (fields.invoice_date !== undefined) airtableFields['invoice date'] = fields.invoice_date;
  if (fields.due_date !== undefined) airtableFields['due date'] = fields.due_date;
  if (fields.status !== undefined) airtableFields['status'] = fields.status;
  if (fields.notes !== undefined) airtableFields['notes'] = fields.notes;
  if (fields.payment_URL !== undefined) airtableFields['payment URL'] = fields.payment_URL;
  if (fields.uploaded_by !== undefined) airtableFields['uploaded by'] = fields.uploaded_by;
  if (fields.email !== undefined) airtableFields['email'] = fields.email;

  // Optional fields
  if (fields.currency_preference) airtableFields['currency_preference'] = fields.currency_preference;
  if (fields.invoice_file) airtableFields['invoice file'] = fields.invoice_file;
  if (fields.paid_at) airtableFields['paid at'] = fields.paid_at;
  if (fields.paid_by) airtableFields['paid by'] = fields.paid_by;
  if (fields.cancelled_at) airtableFields['cancelled_at'] = fields.cancelled_at;
  if (fields.cancelled_by) airtableFields['cancelled by'] = fields.cancelled_by;

  console.log('📮 Final Airtable fields being sent:', JSON.stringify(airtableFields, null, 2));

  const result = await createRecord<Invoice>(VENDORS_TABLE_ID, airtableFields);

  console.log('✅ Airtable record created successfully:', result.id);

  return {
    ...result,
    _source: 'vendors',
    _tableId: VENDORS_TABLE_ID,
  };
}

/**
 * Update invoice in Invoices table
 */
export async function updateInvoice(id: string, data: Partial<Invoice>): Promise<Invoice> {
  if (!INVOICES_TABLE_ID) throw new Error('INVOICES_TABLE_ID not configured');

  // Remove internal fields before sending to Airtable
  const { _source, _tableId, invoice_number, ...fields } = data;

  console.log('🔄 Updating Invoices table record:', id);
  console.log('📝 Fields to update:', JSON.stringify(fields, null, 2));

  const result = await updateRecord<Invoice>(INVOICES_TABLE_ID, id, fields);

  return {
    ...result,
    _source: 'invoices',
    _tableId: INVOICES_TABLE_ID,
  };
}

/**
 * Update invoice in Vendors table
 * Maps field names from code format (snake_case) to Airtable format (space separated)
 */
export async function updateVendorInvoice(id: string, data: Partial<Invoice>): Promise<Invoice> {
  if (!VENDORS_TABLE_ID) throw new Error('VENDORS_TABLE_ID not configured');

  // Remove internal fields before sending to Airtable
  const { _source, _tableId, invoice_number, ...fields } = data;

  // Map field names to Airtable column names (Airtable uses spaces, not underscores)
  const airtableFields: Record<string, any> = {};

  // Send fields even if empty string (Airtable expects them)
  if (fields.vendor_name !== undefined) airtableFields['vendor name'] = fields.vendor_name;
  if (fields.amount !== undefined) airtableFields['amount'] = fields.amount;
  if (fields.currency !== undefined) airtableFields['currency'] = fields.currency;
  if (fields.invoice_date !== undefined) airtableFields['invoice date'] = fields.invoice_date;
  if (fields.due_date !== undefined) airtableFields['due date'] = fields.due_date;
  if (fields.status !== undefined) airtableFields['status'] = fields.status;
  if (fields.notes !== undefined) airtableFields['notes'] = fields.notes;
  if (fields.payment_URL !== undefined) airtableFields['payment URL'] = fields.payment_URL;
  if (fields.uploaded_by !== undefined) airtableFields['uploaded by'] = fields.uploaded_by;
  if (fields.email !== undefined) airtableFields['email'] = fields.email;

  // Optional fields
  if (fields.currency_preference) airtableFields['currency_preference'] = fields.currency_preference;
  if (fields.invoice_file) airtableFields['invoice file'] = fields.invoice_file;
  if (fields.paid_at) airtableFields['paid at'] = fields.paid_at;
  if (fields.paid_by) airtableFields['paid by'] = fields.paid_by;
  if (fields.cancelled_at) airtableFields['cancelled_at'] = fields.cancelled_at;
  if (fields.cancelled_by) airtableFields['cancelled by'] = fields.cancelled_by;

  console.log('🔄 Updating Vendors table record:', id);
  console.log('📝 Fields to update:', JSON.stringify(airtableFields, null, 2));

  const result = await updateRecord<Invoice>(VENDORS_TABLE_ID, id, airtableFields);

  return {
    ...result,
    _source: 'vendors',
    _tableId: VENDORS_TABLE_ID,
  };
}
