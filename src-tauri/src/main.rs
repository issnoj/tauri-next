// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{CustomMenuItem, Manager, Menu, MenuItem, Submenu, WindowBuilder};

mod cmd;

fn main() {
    let quit = CustomMenuItem::new("quit".to_string(), "Quit");
    let close = CustomMenuItem::new("close".to_string(), "Close");
    let submenu = Submenu::new("File", Menu::new().add_item(quit).add_item(close));
    let menu = Menu::new()
        .add_native_item(MenuItem::Copy)
        .add_item(CustomMenuItem::new("hide", "Hide"))
        .add_submenu(submenu);

    tauri::Builder::default()
        .menu(menu)
        .on_menu_event(|event| {
            match event.menu_item_id() {
                "quit" => {
                    std::process::exit(0);
                }
                "close" => {
                    event.window().close().unwrap();
                }
                _ => {}
            }
        })
        .invoke_handler(tauri::generate_handler![
            cmd::get_home_dir,
            cmd::get_entries
        ])
        .setup(|app| {
            app.listen_global("front-to-back", |event| {
                println!("got: {:?}", event.payload().unwrap())
            });

            let app_handle = app.app_handle();
            std::thread::spawn(move || loop {
                app_handle
                    .emit_all("back-to-front", "ping front".to_string())
                    .unwrap();
                std::thread::sleep(std::time::Duration::from_secs(1))
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}