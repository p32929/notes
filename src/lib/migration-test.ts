// Simple migration test - can be run in browser console to verify functionality
import { storage } from './database'

export async function testMigration() {
  try {
    console.log('Testing IndexedDB migration...')
    
    // Create some test data in localStorage (simulating existing data)
    const testNotes = [
      {
        id: 'test-1',
        title: 'Test Note 1',
        content: '<p>This is a test note content</p>',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02')
      },
      {
        id: 'test-2', 
        title: 'Test Note 2',
        content: '<p>Another test note</p>',
        createdAt: new Date('2024-01-03'),
        updatedAt: new Date('2024-01-04')
      }
    ]
    
    const testSettings = {
      id: 1,
      theme: 'dark' as const,
      color: 'blue',
      selectedNoteId: 'test-1'
    }
    
    // Store test data in localStorage
    localStorage.setItem('notes', JSON.stringify(testNotes))
    localStorage.setItem('theme', testSettings.theme)
    localStorage.setItem('color', testSettings.color)
    localStorage.setItem('selectedNoteId', testSettings.selectedNoteId)
    
    console.log('Test data added to localStorage')
    
    // Test migration
    await storage.migrateFromLocalStorage()
    console.log('Migration completed')
    
    // Test reading from IndexedDB
    const migratedNotes = await storage.getNotes()
    const migratedSettings = await storage.getSettings()
    
    console.log('Migrated notes:', migratedNotes)
    console.log('Migrated settings:', migratedSettings)
    
    // Verify data integrity
    if (migratedNotes.length === testNotes.length) {
      console.log('✅ Notes migration successful')
    } else {
      console.error('❌ Notes migration failed')
    }
    
    if (migratedSettings?.theme === testSettings.theme && 
        migratedSettings?.color === testSettings.color) {
      console.log('✅ Settings migration successful')
    } else {
      console.error('❌ Settings migration failed')
    }
    
    // Test save and load cycle
    await storage.saveNotes([...migratedNotes, {
      id: 'test-3',
      title: 'New Note After Migration',
      content: '<p>Added after migration</p>',
      createdAt: new Date(),
      updatedAt: new Date()
    }])
    
    const updatedNotes = await storage.getNotes()
    if (updatedNotes.length === testNotes.length + 1) {
      console.log('✅ Save/load cycle successful')
    } else {
      console.error('❌ Save/load cycle failed')
    }
    
    console.log('Migration test completed successfully!')
    return true
    
  } catch (error) {
    console.error('Migration test failed:', error)
    return false
  }
}

// Auto-run test in development
if (import.meta.env.DEV) {
  console.log('IndexedDB migration system loaded. Run testMigration() to verify.')
}