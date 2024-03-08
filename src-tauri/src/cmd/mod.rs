use std::env;
use std::path::PathBuf;

#[tauri::command]
pub fn get_home_dir() -> String {
    let home_dir = env::var("HOME").unwrap();
    format!("{home_dir}")
}

#[derive(Debug,serde::Serialize)]
pub struct DirEntry {
    path: PathBuf,
    name: String,
    is_dir: bool,
}

#[tauri::command]
pub fn get_entries(path: &str) -> Result<Vec<DirEntry>, String> {
    let dir_path = PathBuf::from(path);
    if !dir_path.is_dir() {
        return Err(format!("Directory not found: {}", dir_path.display()));
    }

    let mut entries = Vec::new();

    for entry in std::fs::read_dir(dir_path).map_err(|err| err.to_string())? {
        let entry = entry.map_err(|err| err.to_string())?.path();
        let path = entry.as_path();
        let name = path
            .file_name()
            .and_then(|n| n.to_str().map(ToString::to_string))
            .unwrap_or_else(|| "".to_string());

        entries.push(DirEntry {
            path: path.to_path_buf(),
            name,
            is_dir: path.is_dir(),
        });
    }

    Ok(entries)
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::env;
    use std::fs::File;
    use tempfile::TempDir;

    #[test]
    fn test_get_home_dir() {
        let expected = env::var("HOME").unwrap();
        let actual = get_home_dir();
        assert_eq!(actual, expected);
    }

    #[test]
    fn test_get_entries_for_dir() {
        let tmp_dir = TempDir::new().expect("Failed to create temporary directory");
        let dir_path = tmp_dir.path().to_str().unwrap();

        // ディレクトリ内にファイルを作成
        let file_path = tmp_dir.path().join("file.txt");
        let _file = File::create(file_path).expect("Failed to create file");

        let entries = get_entries(dir_path).expect("Failed to get directory entries");

        // ディレクトリ内のエントリ数をチェック
        assert_eq!(entries.len(), 1);

        // エントリの内容をチェック
        let entry = &entries[0];
        assert_eq!(entry.name, "file.txt");
        assert!(!entry.is_dir);
    }

    #[test]
    fn test_get_entries_for_non_existent_dir() {
        let non_existent_dir = "/path/to/non/existent/directory";
        let result = get_entries(non_existent_dir);
        assert!(result.is_err());
        assert_eq!(
            result.unwrap_err(),
            format!("Directory not found: {}", non_existent_dir)
        );
    }

    #[test]
    fn test_get_entries_for_home_dir() {
        let home_dir = env::var("HOME").expect("Failed to get HOME environment variable");
        let entries = get_entries(&home_dir).expect("Failed to get directory entries");
        assert!(entries.len() > 0);
    }
}