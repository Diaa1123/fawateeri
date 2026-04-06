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

    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fields }),
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
