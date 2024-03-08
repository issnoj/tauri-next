// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// use std::path::PathBuf;
// use tauri::PathResolver;

mod cmd;

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            cmd::get_home_dir,
            cmd::get_entries
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}