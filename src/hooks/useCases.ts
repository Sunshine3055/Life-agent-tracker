import { useState, useEffect } from 'react';
import { Case, CaseManagerContact } from '../types';

const STORAGE_KEY = 'lifeguard_cases_v1';
const CONTACTS_KEY = 'lifeguard_contacts_v1';

export function useCases() {
  const [cases, setCases] = useState<Case[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const [contacts, setContacts] = useState<CaseManagerContact[]>(() => {
    const saved = localStorage.getItem(CONTACTS_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cases));
  }, [cases]);

  useEffect(() => {
    localStorage.setItem(CONTACTS_KEY, JSON.stringify(contacts));
  }, [contacts]);

  const addCase = (newCase: Omit<Case, 'createdAt' | 'updatedAt' | 'archived' | 'followUpLog'>) => {
    const fullCase: Case = {
      ...newCase,
      followUpLog: [],
      archived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setCases(prev => [fullCase, ...prev]);
  };

  const updateCase = (id: string, updates: Partial<Case>) => {
    setCases(prev => prev.map(c => 
      c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c
    ));
  };

  const deleteCase = (id: string) => {
    setCases(prev => prev.filter(c => c.id !== id));
  };

  const addFollowUp = (caseId: string, entry: Omit<Case['followUpLog'][0], 'id' | 'timestamp'>) => {
    const newEntry = {
      ...entry,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    };
    setCases(prev => prev.map(c => 
      c.id === caseId 
        ? { 
            ...c, 
            followUpLog: [newEntry, ...c.followUpLog],
            updatedAt: new Date().toISOString() 
          } 
        : c
    ));
  };

  const appendNote = (caseId: string, noteText: string) => {
    const timestampedNote = `\n[${new Date().toLocaleString()}] ${noteText}`;
    setCases(prev => prev.map(c => 
      c.id === caseId 
        ? { 
            ...c, 
            notes: (c.notes || '') + timestampedNote,
            updatedAt: new Date().toISOString() 
          } 
        : c
    ));
  };

  const addContact = (contact: Omit<CaseManagerContact, 'id'>) => {
    const newContact = { ...contact, id: crypto.randomUUID() };
    setContacts(prev => [newContact, ...prev]);
  };

  const updateContact = (id: string, updates: Partial<CaseManagerContact>) => {
    setContacts(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const deleteContact = (id: string) => {
    setContacts(prev => prev.filter(c => c.id !== id));
  };

  return {
    cases,
    contacts,
    addCase,
    updateCase,
    deleteCase,
    addFollowUp,
    appendNote,
    addContact,
    updateContact,
    deleteContact
  };
}
